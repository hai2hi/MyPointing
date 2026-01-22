# Deployment Checklist

Use this checklist to ensure smooth deployment.

## Pre-Deployment

- [ ] All code committed and pushed to GitHub
- [ ] Local build tested: `cd server && npm run build`
- [ ] Local build tested: `cd client && npm run build`
- [ ] Environment variables documented
- [ ] CORS configuration reviewed

## Server Deployment (Render.com)

- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Web Service created with settings:
  - [ ] Root Directory: `server`
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Start Command: `npm start`
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `CLIENT_URL` (update after client deployment)
- [ ] Deployment successful
- [ ] Server URL noted: `_______________________________`

## Client Deployment (Vercel)

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project created with settings:
  - [ ] Root Directory: `client`
  - [ ] Framework: Vite
- [ ] Environment variable set:
  - [ ] `VITE_SERVER_URL` = (your Render server URL)
- [ ] Deployment successful
- [ ] Client URL noted: `_______________________________`

## Post-Deployment

- [ ] Updated `CLIENT_URL` on Render with Vercel URL
- [ ] Render service redeployed
- [ ] WebSocket connection tested
- [ ] Room creation tested
- [ ] Multi-user voting tested
- [ ] Room deletion tested
- [ ] Mobile responsiveness checked

## Optional

- [ ] Custom domain configured on Vercel
- [ ] Custom domain configured on Render
- [ ] Analytics enabled
- [ ] Monitoring/alerts set up
- [ ] Performance tested

## URLs

**Server (Render)**: _______________________________

**Client (Vercel)**: _______________________________

**GitHub Repo**: _______________________________

## Notes

_______________________________
_______________________________
_______________________________
