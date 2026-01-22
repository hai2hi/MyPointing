# MyPointing - Planning Poker Application

A real-time Scrum Planning Poker tool built with React, TypeScript, Socket.IO, and Node.js.

## Features

- 🎯 Real-time voting synchronization
- 👥 Multi-user support
- 📊 Vote distribution visualization with pie charts
- 🔄 Round management (reveal, reset)
- 🗑️ Room deletion with tombstone mechanism
- 📱 Responsive design
- 🔒 Admin controls
- ⚡ WebSocket-only communication (no polling)

## Tech Stack

### Client
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Socket.IO Client** - Real-time communication
- **React Router** - Navigation

### Server
- **Node.js** - Runtime
- **Express** - Web framework
- **Socket.IO** - WebSocket server
- **TypeScript** - Type safety

## Project Structure

```
MyPointing/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context (Socket)
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript types
│   │   ├── constants/     # Constants and configs
│   │   └── socket.ts      # Socket.IO client setup
│   └── package.json
│
├── server/                # Backend application
│   ├── src/
│   │   ├── handlers.ts    # Socket event handlers
│   │   ├── types.ts       # TypeScript types
│   │   ├── constants.ts   # Constants
│   │   └── index.ts       # Server entry point
│   └── package.json
│
├── DEPLOYMENT_GUIDE.md    # Deployment instructions
└── DEPLOYMENT_CHECKLIST.md # Deployment checklist
```

## Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MyPointing
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**

   **Server** (`server/.env`):
   ```env
   PORT=3001
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

   **Client** (`client/.env`):
   ```env
   VITE_SERVER_URL=http://localhost:3001
   ```

### Running Locally

1. **Start the server** (in `server/` directory):
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:3001`

2. **Start the client** (in `client/` directory):
   ```bash
   npm run dev
   ```
   Client will run on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## Building for Production

### Server
```bash
cd server
npm run build
npm start
```

### Client
```bash
cd client
npm run build
npm run preview
```

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deployment Summary

**Server**: Deploy to [Render.com](https://render.com)
- Root Directory: `server`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Client**: Deploy to [Vercel](https://vercel.com)
- Root Directory: `client`
- Framework: Vite
- Build Command: `npm run build`

## Environment Variables

### Server (Render.com)
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `CLIENT_URL` | Allowed CORS origin | `https://mypointing.vercel.app` |
| `PORT` | Server port (optional) | `10000` |

### Client (Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SERVER_URL` | Backend server URL | `https://mypointing-server.onrender.com` |

## How to Use

1. **Create a New Room**
   - Enter room name and your username
   - Click "Create Room"
   - Share the room URL with team members

2. **Join Existing Room**
   - Click "Join Existing Room"
   - Enter the room URL
   - Enter your username

3. **Vote**
   - Select a card value
   - Wait for all participants to vote
   - Admin reveals votes

4. **View Results**
   - See vote distribution in pie chart
   - View voting history
   - Start new round

## Key Features Explained

### Real-Time Synchronization
All votes and room state changes are synchronized in real-time using WebSocket connections.

### Tombstone Mechanism
Prevents users from rejoining recently deleted rooms, providing clear feedback about room status.

### Admin Controls
Room creator has admin privileges to:
- Reveal votes
- Reset votes
- Delete room

### Vote Distribution Chart
Visual representation of voting results using pie charts for easy consensus identification.

## Troubleshooting

### Connection Issues
- Ensure server is running
- Check CORS configuration
- Verify environment variables are set correctly

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using React, TypeScript, and Socket.IO**
