# Quick Deployment Reference

## 🚀 Render.com (Server)

### Settings
```
Name: mypointing-server
Region: [Choose closest to users]
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

### Environment Variables
```
NODE_ENV=production
CLIENT_URL=https://[YOUR-VERCEL-URL].vercel.app
```

---

## ⚡ Vercel (Client)

### Settings
```
Framework: Vite
Root Directory: client
Build Command: npm run build (auto-detected)
Output Directory: dist (auto-detected)
```

### Environment Variables
```
VITE_SERVER_URL=https://[YOUR-RENDER-URL].onrender.com
```

---

## 📋 Deployment Order

1. ✅ **Deploy Server to Render** → Get server URL
2. ✅ **Deploy Client to Vercel** → Use server URL in env vars → Get client URL
3. ✅ **Update Server** → Add client URL to `CLIENT_URL` env var → Redeploy

---

## 🔍 Testing Checklist

- [ ] WebSocket connects (check browser console)
- [ ] Create room works
- [ ] Join room works
- [ ] Voting syncs in real-time
- [ ] Reveal votes shows chart
- [ ] Reset votes clears board
- [ ] Delete room redirects users
- [ ] Mobile responsive

---

## 🐛 Common Issues

**CORS Error**
- Check `CLIENT_URL` matches Vercel URL exactly (with https://)
- Ensure no trailing slashes
- Redeploy server after env var changes

**Connection Failed**
- Render free tier sleeps after inactivity (30s cold start)
- Check `VITE_SERVER_URL` is set in Vercel
- Verify server is running in Render logs

**Build Failed**
- Check build logs in dashboard
- Test build locally first: `npm run build`
- Ensure all dependencies in `dependencies` (not `devDependencies`)

---

## 📊 Monitoring

**Render Logs**: Dashboard → Service → Logs
**Vercel Logs**: Dashboard → Project → Deployments → Function Logs

---

## 🔗 Important Links

- [Render Dashboard](https://dashboard.render.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Socket.IO Docs](https://socket.io/docs/v4/)
