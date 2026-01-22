# MyPointing Deployment Guide

Complete guide to deploy the MyPointing application with the server on **Render.com** and the client on **Vercel**.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Server Deployment (Render.com)](#server-deployment-rendercom)
3. [Client Deployment (Vercel)](#client-deployment-vercel)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] GitHub repository with your code pushed
- [ ] Render.com account created
- [ ] Vercel account created
- [ ] All environment variables identified
- [ ] CORS configured properly
- [ ] Build scripts tested locally

---

## Server Deployment (Render.com)

### Step 1: Prepare Server Code

#### 1.1 Environment Variables Setup

Create a `.env.example` file in the `server/` directory:

```env
PORT=3001
NODE_ENV=production
CLIENT_URL=https://your-app.vercel.app
```

#### 1.2 Update CORS Configuration

The server code needs to accept the Vercel client URL. This is already handled in `src/index.ts` but will be configured via environment variable.

#### 1.3 Verify Build Configuration

Ensure `package.json` has the correct scripts:

```json
{
  "scripts": {
    "dev": "nodemon --watch 'src/**/*.ts' --exec 'ts-node' src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

✅ **Already configured correctly**

---

### Step 2: Create Render Web Service

#### 2.1 Connect Repository

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `MyPointing` repository

#### 2.2 Configure Service Settings

| Setting | Value |
|---------|-------|
| **Name** | `mypointing-server` (or your preferred name) |
| **Region** | Choose closest to your users |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (or paid for better performance) |

#### 2.3 Set Environment Variables

In the Render dashboard, add these environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Sets production mode |
| `CLIENT_URL` | `https://your-app.vercel.app` | Replace with actual Vercel URL after client deployment |
| `PORT` | `10000` | Render uses port 10000 by default (optional, Render sets this) |

> **Note**: You'll update `CLIENT_URL` after deploying the client to Vercel.

#### 2.4 Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy
3. Wait for deployment to complete (5-10 minutes)
4. Note your server URL: `https://mypointing-server.onrender.com`

---

### Step 3: Verify Server Deployment

Once deployed, test the server:

```bash
# Check if server is running
curl https://mypointing-server.onrender.com
```

You should see the server responding. Check the Render logs for any errors.

---

## Client Deployment (Vercel)

### Step 1: Prepare Client Code

#### 1.1 Environment Variables Setup

Create `.env.example` in the `client/` directory:

```env
VITE_SERVER_URL=https://mypointing-server.onrender.com
```

Create `.env.production` in the `client/` directory:

```env
VITE_SERVER_URL=https://mypointing-server.onrender.com
```

> **Important**: Replace with your actual Render server URL from Step 2.4

#### 1.2 Update Socket Connection

The socket URL is currently hardcoded. We've already updated it to use environment variables (see code changes below).

#### 1.3 Verify Build Configuration

Ensure `package.json` has the correct scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

✅ **Already configured correctly**

---

### Step 2: Create Vercel Project

#### 2.1 Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the `MyPointing` repository

#### 2.2 Configure Project Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` (auto-detected) |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` (auto-detected) |
| **Output Directory** | `dist` (auto-detected) |
| **Install Command** | `npm install` (auto-detected) |

#### 2.3 Set Environment Variables

In the Vercel project settings, add:

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_SERVER_URL` | `https://mypointing-server.onrender.com` | Your Render server URL |

> **Important**: Replace with your actual Render server URL.

#### 2.4 Deploy

1. Click **"Deploy"**
2. Vercel will automatically build and deploy
3. Wait for deployment to complete (2-5 minutes)
4. Note your client URL: `https://mypointing.vercel.app` (or custom domain)

---

### Step 3: Update Server CORS

Now that you have the Vercel URL, update the server's `CLIENT_URL` environment variable:

1. Go to Render Dashboard → Your Web Service
2. Navigate to **"Environment"** tab
3. Update `CLIENT_URL` to your Vercel URL: `https://mypointing.vercel.app`
4. Click **"Save Changes"**
5. Render will automatically redeploy with the new configuration

---

## Post-Deployment Configuration

### Update CORS on Server

The server's CORS configuration will now use the environment variable:

```typescript
// server/src/index.ts
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST']
    },
    transports: ['websocket']
});
```

### Configure Custom Domains (Optional)

#### For Vercel (Client):
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

#### For Render (Server):
1. Go to Web Service Settings → Custom Domain
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Testing & Verification

### 1. Test WebSocket Connection

1. Open your Vercel app: `https://mypointing.vercel.app`
2. Open browser DevTools → Console
3. Look for: `"Connected to socket server"`
4. If you see connection errors, check CORS settings

### 2. Test Room Creation

1. Click "Create New Room"
2. Enter room name and username
3. Click "Create Room"
4. Verify you're redirected to the game page

### 3. Test Real-Time Features

1. Open the game in two different browsers/tabs
2. Join the same room
3. Test voting, revealing, and resetting votes
4. Verify real-time updates work

### 4. Test Room Deletion

1. As admin, delete a room
2. Verify all participants are redirected
3. Verify tombstone mechanism prevents rejoining

### 5. Monitor Logs

#### Render Logs:
- Go to Render Dashboard → Your Service → Logs
- Monitor for connection events and errors

#### Vercel Logs:
- Go to Vercel Dashboard → Your Project → Deployments
- Click on deployment → View Function Logs

---

## Troubleshooting

### Issue: WebSocket Connection Failed

**Symptoms**: Client shows "Connection Error" modal

**Solutions**:
1. Verify `VITE_SERVER_URL` is set correctly in Vercel
2. Check Render server is running (not sleeping on free tier)
3. Verify CORS `CLIENT_URL` matches Vercel URL exactly
4. Check browser console for specific error messages

**Check**:
```javascript
// In browser console
console.log(import.meta.env.VITE_SERVER_URL)
```

---

### Issue: CORS Errors

**Symptoms**: Browser console shows CORS policy errors

**Solutions**:
1. Verify `CLIENT_URL` in Render matches Vercel URL (including `https://`)
2. Ensure no trailing slashes in URLs
3. Redeploy server after updating environment variables
4. Check if Render service restarted successfully

**Verify CORS**:
```bash
# Test from command line
curl -H "Origin: https://mypointing.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://mypointing-server.onrender.com
```

---

### Issue: Server Sleeping (Render Free Tier)

**Symptoms**: First connection takes 30+ seconds

**Solutions**:
1. Render free tier spins down after inactivity
2. First request wakes it up (cold start)
3. Consider upgrading to paid tier for always-on service
4. Implement a keep-alive ping service (optional)

**Keep-Alive Option**:
Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your server every 5 minutes.

---

### Issue: Build Failures

#### Server Build Fails

**Check**:
1. Verify TypeScript compiles locally: `npm run build`
2. Check Render build logs for specific errors
3. Ensure all dependencies are in `dependencies`, not `devDependencies`
4. Verify Node version compatibility

#### Client Build Fails

**Check**:
1. Verify Vite builds locally: `npm run build`
2. Check Vercel build logs for specific errors
3. Ensure environment variables are set
4. Verify TypeScript types are correct

---

### Issue: Environment Variables Not Working

**Symptoms**: App uses default values instead of environment variables

**Solutions**:

**For Vercel**:
1. Environment variables must start with `VITE_` to be exposed to client
2. Redeploy after adding/changing variables
3. Check Variables tab in Project Settings

**For Render**:
1. Verify variables are set in Environment tab
2. Service must redeploy after changes
3. Check logs to see if variables are loaded

---

### Issue: Room State Not Syncing

**Symptoms**: Votes not appearing, state not updating

**Solutions**:
1. Check WebSocket connection is established
2. Verify both users are in the same room
3. Check server logs for emit/receive events
4. Ensure room IDs match exactly

---

## Performance Optimization

### Server (Render)

1. **Upgrade Instance**: Free tier has limited resources
2. **Enable Auto-Deploy**: Automatically deploy on git push
3. **Health Checks**: Configure health check endpoint
4. **Monitoring**: Set up alerts for downtime

### Client (Vercel)

1. **Edge Network**: Vercel automatically uses CDN
2. **Automatic HTTPS**: Already configured
3. **Preview Deployments**: Test changes before production
4. **Analytics**: Enable Vercel Analytics for insights

---

## Security Checklist

- [ ] CORS configured with specific origin (not `*` in production)
- [ ] Environment variables set (not hardcoded)
- [ ] HTTPS enabled on both client and server
- [ ] No sensitive data in client-side code
- [ ] Rate limiting considered for production
- [ ] Input validation on server-side

---

## Maintenance

### Regular Tasks

1. **Monitor Logs**: Check for errors weekly
2. **Update Dependencies**: Monthly security updates
3. **Backup Strategy**: Git repository is your backup
4. **Performance Monitoring**: Track response times

### Updating the Application

1. **Push to GitHub**: `git push origin main`
2. **Vercel**: Auto-deploys on push (if configured)
3. **Render**: Auto-deploys on push (if configured)
4. **Manual Deploy**: Trigger from dashboard if needed

---

## Quick Reference

### Important URLs

| Service | Purpose | Example URL |
|---------|---------|-------------|
| Render Server | Backend API | `https://mypointing-server.onrender.com` |
| Vercel Client | Frontend App | `https://mypointing.vercel.app` |
| GitHub Repo | Source Code | `https://github.com/yourusername/MyPointing` |

### Environment Variables Summary

**Server (Render)**:
- `NODE_ENV=production`
- `CLIENT_URL=https://mypointing.vercel.app`

**Client (Vercel)**:
- `VITE_SERVER_URL=https://mypointing-server.onrender.com`

---

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Deployment Complete!** 🚀

Your MyPointing application should now be live and accessible worldwide.
