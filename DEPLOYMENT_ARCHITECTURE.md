# Deployment Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                               │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐                    ┌──────────────────────┐
│                      │                    │                      │
│   Vercel (Client)    │◄──────────────────►│  Render (Server)     │
│                      │   WebSocket (WSS)  │                      │
│  mypointing.         │                    │  mypointing-server.  │
│  vercel.app          │                    │  onrender.com        │
│                      │                    │                      │
│  - React App         │                    │  - Node.js           │
│  - Static Files      │                    │  - Socket.IO Server  │
│  - CDN Delivery      │                    │  - Express           │
│                      │                    │                      │
└──────────────────────┘                    └──────────────────────┘
         ▲                                            ▲
         │                                            │
         │ HTTPS                                      │ WSS/HTTPS
         │                                            │
         ▼                                            │
┌──────────────────────┐                             │
│                      │                             │
│   User's Browser     │─────────────────────────────┘
│                      │
│  - Socket.IO Client  │
│  - React Components  │
│                      │
└──────────────────────┘
```

---

## Environment Variables Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT VARIABLES                         │
└─────────────────────────────────────────────────────────────────┘

SERVER (Render.com)                    CLIENT (Vercel)
┌─────────────────────┐               ┌──────────────────────┐
│                     │               │                      │
│ NODE_ENV=production │               │ VITE_SERVER_URL=     │
│                     │               │ https://mypointing-  │
│ CLIENT_URL=         │◄──────────────┤ server.onrender.com  │
│ https://mypointing. │   Must Match  │                      │
│ vercel.app          ├──────────────►│                      │
│                     │               │                      │
└─────────────────────┘               └──────────────────────┘
         │                                      │
         │                                      │
         ▼                                      ▼
┌─────────────────────┐               ┌──────────────────────┐
│  CORS Configuration │               │  Socket Connection   │
│                     │               │                      │
│  origin: process.   │               │  const URL = import. │
│  env.CLIENT_URL     │               │  meta.env.VITE_      │
│                     │               │  SERVER_URL          │
└─────────────────────┘               └──────────────────────┘
```

---

## Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT STEPS                            │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Push to GitHub
┌──────────────────────┐
│   Local Machine      │
│                      │
│   git add .          │
│   git commit -m ""   │
│   git push           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   GitHub Repo        │
│                      │
│   main branch        │
└──────┬───────┬───────┘
       │       │
       │       │
       ▼       ▼
┌──────────┐ ┌──────────┐
│ Render   │ │ Vercel   │
│ Webhook  │ │ Webhook  │
└──────────┘ └──────────┘

STEP 2: Deploy Server (Render)
┌──────────────────────┐
│   Render.com         │
│                      │
│ 1. npm install       │
│ 2. npm run build     │
│ 3. npm start         │
│                      │
│ ✅ Server Live       │
│ URL: https://...     │
└──────────────────────┘

STEP 3: Deploy Client (Vercel)
┌──────────────────────┐
│   Vercel             │
│                      │
│ 1. npm install       │
│ 2. npm run build     │
│ 3. Deploy to CDN     │
│                      │
│ ✅ Client Live       │
│ URL: https://...     │
└──────────────────────┘

STEP 4: Update Server CORS
┌──────────────────────┐
│   Render.com         │
│                      │
│ Update CLIENT_URL    │
│ Redeploy             │
│                      │
│ ✅ CORS Configured   │
└──────────────────────┘
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    REAL-TIME COMMUNICATION                       │
└─────────────────────────────────────────────────────────────────┘

User A                          Server                      User B
┌──────┐                    ┌──────────┐                  ┌──────┐
│      │                    │          │                  │      │
│  🧑  │                    │  Socket  │                  │  👤  │
│      │                    │   .IO    │                  │      │
└───┬──┘                    └────┬─────┘                  └───┬──┘
    │                            │                            │
    │ 1. Submit Vote             │                            │
    ├───────────────────────────►│                            │
    │    {vote: "5"}             │                            │
    │                            │                            │
    │                            │ 2. Broadcast Update        │
    │                            ├───────────────────────────►│
    │                            │    {roomState: {...}}      │
    │                            │                            │
    │ 3. Receive Update          │                            │
    │◄───────────────────────────┤                            │
    │    {roomState: {...}}      │                            │
    │                            │                            │
    │                            │ 4. User B Votes            │
    │                            │◄───────────────────────────┤
    │                            │    {vote: "8"}             │
    │                            │                            │
    │ 5. Receive Update          │ 6. Broadcast Update        │
    │◄───────────────────────────┼───────────────────────────►│
    │    {roomState: {...}}      │    {roomState: {...}}      │
    │                            │                            │
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY MEASURES                           │
└─────────────────────────────────────────────────────────────────┘

Layer 1: HTTPS/WSS
┌──────────────────────────────────────────────────────────────┐
│  All traffic encrypted with TLS                              │
│  ✅ Vercel: Automatic HTTPS                                  │
│  ✅ Render: Automatic HTTPS                                  │
└──────────────────────────────────────────────────────────────┘

Layer 2: CORS
┌──────────────────────────────────────────────────────────────┐
│  Only allowed origins can connect                            │
│  ✅ Production: Specific Vercel domain only                  │
│  ✅ Development: Localhost allowed                           │
└──────────────────────────────────────────────────────────────┘

Layer 3: Environment Variables
┌──────────────────────────────────────────────────────────────┐
│  Sensitive config not in code                                │
│  ✅ Server: Render environment variables                     │
│  ✅ Client: Vercel environment variables                     │
│  ✅ Git: .env files ignored                                  │
└──────────────────────────────────────────────────────────────┘

Layer 4: WebSocket Only
┌──────────────────────────────────────────────────────────────┐
│  No HTTP polling fallback                                    │
│  ✅ Reduced attack surface                                   │
│  ✅ More predictable connections                             │
└──────────────────────────────────────────────────────────────┘
```

---

## File Structure After Deployment Prep

```
MyPointing/
│
├── 📄 README.md                      # Project documentation
├── 📄 DEPLOYMENT_GUIDE.md            # Full deployment guide
├── 📄 DEPLOYMENT_CHECKLIST.md        # Deployment checklist
├── 📄 QUICK_DEPLOY_REFERENCE.md      # Quick reference
├── 📄 DEPLOYMENT_PREP_SUMMARY.md     # Summary of changes
├── 📄 DEPLOYMENT_ARCHITECTURE.md     # This file
├── 📄 .gitignore                     # Git ignore rules
│
├── 📁 client/
│   ├── 📄 .env                       # Local dev config
│   ├── 📄 .env.example               # Env template
│   ├── 📄 package.json
│   ├── 📁 src/
│   │   ├── 📄 socket.ts              # ✨ Updated for env vars
│   │   ├── 📁 components/
│   │   ├── 📁 context/
│   │   ├── 📁 pages/
│   │   └── ...
│   └── ...
│
└── 📁 server/
    ├── 📄 .env.example               # Env template
    ├── 📄 package.json
    ├── 📁 src/
    │   ├── 📄 index.ts               # ✨ Updated for env vars
    │   ├── 📄 handlers.ts
    │   ├── 📄 types.ts
    │   └── 📄 constants.ts
    └── ...
```

---

## Cost Breakdown

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOSTING COSTS                            │
└─────────────────────────────────────────────────────────────────┘

FREE TIER (Recommended for Testing)
┌──────────────────────┐
│   Render.com         │
│   Free Tier          │
│                      │
│   ✅ 750 hours/month │
│   ⚠️  Spins down     │
│      after inactivity│
│   💰 $0/month        │
└──────────────────────┘

┌──────────────────────┐
│   Vercel             │
│   Hobby Tier         │
│                      │
│   ✅ Unlimited       │
│      bandwidth       │
│   ✅ Always on       │
│   💰 $0/month        │
└──────────────────────┘

TOTAL: $0/month


PAID TIER (Recommended for Production)
┌──────────────────────┐
│   Render.com         │
│   Starter Tier       │
│                      │
│   ✅ Always on       │
│   ✅ Better perf     │
│   💰 $7/month        │
└──────────────────────┘

┌──────────────────────┐
│   Vercel             │
│   Hobby Tier         │
│                      │
│   ✅ Unlimited       │
│   ✅ Always on       │
│   💰 $0/month        │
└──────────────────────┘

TOTAL: $7/month
```

---

## Monitoring Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                    WHAT TO MONITOR                               │
└─────────────────────────────────────────────────────────────────┘

Render Dashboard
├── 📊 Server Status (Running/Stopped)
├── 📈 CPU/Memory Usage
├── 📝 Logs (Real-time)
├── 🔄 Deploy History
└── ⚙️  Environment Variables

Vercel Dashboard
├── 📊 Deployment Status
├── 📈 Analytics (if enabled)
├── 📝 Function Logs
├── 🔄 Deploy History
└── ⚙️  Environment Variables

Browser DevTools
├── 🔌 WebSocket Connection Status
├── 📝 Console Logs
├── 🌐 Network Tab (WS frames)
└── ⚠️  Error Messages
```

---

## Troubleshooting Decision Tree

```
Connection Failed?
│
├─ YES ─► Check Server Status
│         │
│         ├─ Server Down? ─► Check Render Dashboard
│         │                  └─► Restart if needed
│         │
│         ├─ CORS Error? ──► Verify CLIENT_URL matches
│         │                  └─► Redeploy server
│         │
│         └─ Wrong URL? ───► Check VITE_SERVER_URL
│                            └─► Redeploy client
│
└─ NO ──► Connection OK
          │
          └─ Features Not Working?
              │
              ├─ Check Browser Console
              ├─ Check Server Logs
              └─ Verify Room ID matches
```

---

**Visual guide complete!** Use this alongside the deployment guide for a complete understanding of the system architecture.
