# MyPointing Project: Issues, Mistakes & Fixes

**Project**: Online Scrum Planning Poker Tool  
**Tech Stack**: React + Vite + TypeScript (Client) | Node.js + Socket.IO (Server)  
**Documentation Date**: January 22, 2026

---

## Table of Contents

1. [Project Setup Issues](#1-project-setup-issues)
2. [Socket.IO Connection Issues](#2-socketio-connection-issues)
3. [Room Management Issues](#3-room-management-issues)
4. [Backend Architecture Issues](#4-backend-architecture-issues)
5. [UI/UX Performance Issues](#5-uiux-performance-issues)
6. [Feature Implementation Issues](#6-feature-implementation-issues)
7. [Data Persistence Issues](#7-data-persistence-issues)
8. [Key Lessons Learned](#8-key-lessons-learned)

---

## 1. Project Setup Issues

### Issue 1.1: PowerShell Execution Policy Error
**Problem**: `npx` command failed due to PowerShell execution policy restrictions when initializing the project.

**Mistake**: Attempted to run scripts without proper PowerShell permissions on Windows.

**Fix**: 
- Changed PowerShell execution policy using `Set-ExecutionPolicy`
- Alternatively used alternative command execution methods
- Ensured proper permissions for development environment

---

### Issue 1.2: Module Resolution Error
**Problem**: `Cannot find module './App.tsx'` error preventing React Vite TypeScript project from running.

**Mistake**: Incorrect file path or missing file extension in imports.

**Fix**: 
- Corrected import paths in entry files
- Ensured proper file extensions in TypeScript configuration
- Verified module resolution settings in `tsconfig.json`

---

### Issue 1.3: TypeScript Configuration Error
**Problem**: Build error: "Option 'tsBuildInfoFile' cannot be specified without specifying option 'incremental' or option 'composite'"

**Mistake**: Incomplete TypeScript configuration in `tsconfig.app.json`.

**Fix**: 
```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo"
  }
}
```

---

## 2. Socket.IO Connection Issues

### Issue 2.1: Double Socket Connections
**Problem**: React StrictMode causing duplicate socket connections and join/reconnection logs appearing twice in server console.

**Mistake**: Not handling React's double-mount behavior in development mode, which mounts components twice to detect side effects.

**Fix**: 
```typescript
// In SocketContext.tsx
useEffect(() => {
  const socket = io(SERVER_URL, {
    transports: ['websocket'],
    upgrade: false
  });
  
  setSocket(socket);
  
  return () => {
    socket.disconnect(); // Critical cleanup
  };
}, []);
```

**Key Points**:
- Added proper cleanup in `SocketContext` with `socket.disconnect()`
- Implemented connection guards to prevent duplicate connections
- Ensured useEffect cleanup function properly tears down connections

---

### Issue 2.2: HTTP Polling Instead of Pure WebSockets
**Problem**: Application using HTTP polling alongside WebSockets, causing unnecessary network overhead and connection complexity.

**Mistake**: Default Socket.IO configuration includes polling as fallback transport.

**Fix**: 
```typescript
const socket = io(SERVER_URL, {
  transports: ['websocket'],
  upgrade: false
});
```

**Benefits**:
- Reduced network overhead
- More predictable connection behavior
- Cleaner server logs

---

### Issue 2.3: Ghost Socket Connections
**Problem**: "Ghost" socket connections remaining active after component unmount, preventing accurate participant counts and interfering with room deletion logic.

**Mistake**: Missing `socket.disconnect()` in cleanup function combined with React StrictMode's double-mounting.

**Fix**: 
- Ensured proper socket cleanup in `SocketContext` useEffect return function
- Verified disconnect events properly handled on server
- Monitored connection counts to confirm cleanup working

---

### Issue 2.4: Inaccurate Participant Counts
**Problem**: Server-side logs showing incorrect participant counts, making debugging difficult.

**Mistake**: Ghost connections not being properly cleaned up, leading to inflated counts.

**Fix**: 
- Implemented proper disconnect handling on server
- Added connection tracking with proper cleanup
- Fixed ghost connection issue (see Issue 2.3)

---

## 3. Room Management Issues

### Issue 3.1: Silent Room Recreation After Deletion
**Problem**: Users could silently rejoin deleted rooms by using old URLs, causing confusion and unexpected behavior.

**Mistake**: No mechanism to track recently deleted rooms, allowing immediate recreation with same ID.

**Fix**: Implemented "Tombstone" mechanism:

```typescript
// Server-side tombstone tracking
const deletedRoomTombstones = new Map<string, number>();

function handleJoinRoom(socket: Socket, roomId: string) {
  // Check if room was recently deleted
  if (deletedRoomTombstones.has(roomId)) {
    socket.emit('ROOM_DELETED');
    return;
  }
  
  // Normal join logic...
}

function deleteRoom(roomId: string) {
  rooms.delete(roomId);
  deletedRoomTombstones.set(roomId, Date.now());
  
  // Clean up old tombstones after grace period
  setTimeout(() => {
    deletedRoomTombstones.delete(roomId);
  }, TOMBSTONE_TTL);
}
```

**Benefits**:
- Prevents confusing silent recreation
- Provides clear feedback to users
- Maintains data integrity

---

### Issue 3.2: Automatic Room Deletion Not Triggering
**Problem**: Rooms not being deleted after grace period when all users offline, leading to memory leaks.

**Mistake**: Ghost connections preventing `allOffline` condition from being met.

**Fix**: 
- Fixed ghost connection issue (see Issue 2.3)
- Verified automatic deletion logic triggers correctly
- Added logging to monitor deletion events

---

### Issue 3.3: Room Deletion Redirect Issues
**Problem**: Users not properly redirected after room deletion, sometimes stuck on non-existent room pages.

**Mistake**: Incomplete handling of `ROOM_DELETED` event across all interaction points.

**Fix**: Extended tombstone checks to all socket handlers:

```typescript
// Applied to all handlers
function handleSubmitVote(socket: Socket, data: any) {
  if (deletedRoomTombstones.has(data.roomId)) {
    socket.emit('ROOM_DELETED');
    return;
  }
  // Normal vote logic...
}

function handleRevealVotes(socket: Socket, roomId: string) {
  if (deletedRoomTombstones.has(roomId)) {
    socket.emit('ROOM_DELETED');
    return;
  }
  // Normal reveal logic...
}

function handleResetVotes(socket: Socket, roomId: string) {
  if (deletedRoomTombstones.has(roomId)) {
    socket.emit('ROOM_DELETED');
    return;
  }
  // Normal reset logic...
}
```

---

### Issue 3.4: Admin Room Deletion Without Confirmation
**Problem**: Standard browser `alert()` window for room deletion instead of proper confirmation popup, poor UX.

**Mistake**: Using browser's native `alert()` instead of custom UI component.

**Fix**: 
- Implemented custom confirmation popup component
- Added proper styling and UX flow
- Ensured confirmation before destructive action

---

## 4. Backend Architecture Issues

### Issue 4.1: Monolithic Server File
**Problem**: All handler logic in a single large `server.ts` file (500+ lines), difficult to maintain and navigate.

**Mistake**: Not organizing code into modular structure from the start.

**Fix**: Refactored backend into separate files:

```
server/
├── src/
│   ├── index.ts              # Main server entry
│   ├── types.ts              # Type definitions
│   ├── constants.ts          # Ports, event names
│   ├── handlers/
│   │   ├── joinHandler.ts
│   │   ├── voteHandler.ts
│   │   ├── revealHandler.ts
│   │   └── resetHandler.ts
│   └── utils/
│       └── roomManager.ts
```

**Benefits**:
- Improved code organization
- Easier to locate and modify specific functionality
- Better separation of concerns

---

### Issue 4.2: Type Casting Issues
**Problem**: Excessive type casting throughout the codebase (`socket.data as SocketData`), reducing type safety.

**Mistake**: Not using typed `SocketData` interface from the beginning.

**Fix**: 

```typescript
// types.ts
export interface SocketData {
  roomId?: string;
  username?: string;
  isAdmin?: boolean;
}

// Properly typed socket
import { Socket } from 'socket.io';

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;

function handleJoinRoom(socket: TypedSocket, roomId: string) {
  // No casting needed!
  socket.data.roomId = roomId;
  socket.data.username = username;
}
```

**Benefits**:
- Eliminated type casting
- Improved type safety
- Better IDE autocomplete

---

### Issue 4.3: Magic Strings for Events
**Problem**: Event names hardcoded as strings throughout the code, prone to typos and inconsistencies.

**Mistake**: No centralized constant management.

**Fix**: 

```typescript
// constants.ts
export const SOCKET_EVENTS = {
  // Client to Server
  JOIN_ROOM: 'join-room',
  SUBMIT_VOTE: 'submit-vote',
  REVEAL_VOTES: 'reveal-votes',
  RESET_VOTES: 'reset-votes',
  DELETE_ROOM: 'delete-room',
  
  // Server to Client
  ROOM_DELETED: 'room-deleted',
  ROOM_STATE: 'room-state',
  VOTE_SUBMITTED: 'vote-submitted',
  VOTES_REVEALED: 'votes-revealed',
  VOTES_RESET: 'votes-reset',
} as const;

export const SERVER_PORT = 3001;
```

**Benefits**:
- Single source of truth
- Prevents typos
- Easier refactoring

---

## 5. UI/UX Performance Issues

### Issue 5.1: Header Component Unnecessary Re-renders
**Problem**: Header component re-rendering on every vote cast, causing performance degradation.

**Mistake**: Header component placed inside `GamePage`, causing re-renders on any state change.

**Fix**: 

**Initial Attempt** (Suboptimal):
```typescript
// Using React.memo - works but not ideal
export const Header = React.memo(() => {
  // Header content
});
```

**Final Solution** (Optimal):
```typescript
// Moved Header to RouteLayout
// RouteLayout.tsx
export function RouteLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
```

**Benefits**:
- Header only renders once
- No need for memoization
- Cleaner component hierarchy

---

### Issue 5.2: VotingCard Flicker on Vote
**Problem**: Entire card set flickering/re-rendering when a single vote is cast.

**Mistake**: Inefficient rendering logic causing unnecessary re-renders of all cards.

**Fix**: 
```typescript
// Optimized with proper keys and memoization
const VotingCard = React.memo(({ value, onClick, isSelected }) => {
  return (
    <button 
      className={`voting-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {value}
    </button>
  );
});

// In parent component
{VOTING_OPTIONS.map(value => (
  <VotingCard
    key={value}
    value={value}
    onClick={() => handleVote(value)}
    isSelected={selectedVote === value}
  />
))}
```

**Benefits**:
- Only changed cards re-render
- Smooth user experience
- Better performance

---

### Issue 5.3: GamePage Re-rendering on Round Title Input
**Problem**: Entire page re-rendering while typing in round title input, causing lag and poor UX.

**Mistake**: State management causing parent component re-renders on every keystroke.

**Fix**: 
```typescript
// Isolated state management
const RoundTitleInput = () => {
  const [localTitle, setLocalTitle] = useState('');
  
  const handleBlur = () => {
    // Only update parent on blur
    onTitleChange(localTitle);
  };
  
  return (
    <input
      value={localTitle}
      onChange={(e) => setLocalTitle(e.target.value)}
      onBlur={handleBlur}
    />
  );
};
```

**Benefits**:
- No parent re-renders during typing
- Smooth input experience
- Better performance

---

## 6. Feature Implementation Issues

### Issue 6.1: Vote Distribution Chart Implementation
**Problem**: Need to display pie chart instead of voting cards when votes revealed, with toggle functionality.

**Initial Mistake**: Not planning for conditional rendering from the start.

**Fix**: 

```typescript
// GamePage.tsx
{votesRevealed ? (
  <VoteChart votes={currentVotes} />
) : (
  <VotingCards 
    onVote={handleVote}
    selectedVote={myVote}
  />
)}
```

**Implementation**:
- Created `VoteChart` component with Chart.js
- Implemented conditional rendering based on `votesRevealed` state
- Added proper state management for toggle behavior

---

### Issue 6.2: VoteChart Legend Complexity
**Problem**: Legend showing participant names was too complex and cluttered.

**Mistake**: Over-engineering the initial implementation.

**Fix**: 
```typescript
// Simplified legend
options={{
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        generateLabels: (chart) => {
          // Simple vote value labels only
          return chart.data.labels.map((label, i) => ({
            text: label,
            fillStyle: chart.data.datasets[0].backgroundColor[i]
          }));
        }
      }
    }
  }
}}
```

---

### Issue 6.3: Round Title Input Visibility
**Problem**: Round title input visible when votes revealed, causing confusion.

**Mistake**: Not controlling visibility based on game state.

**Fix**: 
```typescript
{!votesRevealed && (
  <input
    type="text"
    placeholder="Enter round title..."
    value={roundTitle}
    onChange={(e) => setRoundTitle(e.target.value)}
  />
)}
```

---

### Issue 6.4: "Rejoin Game" Button Visibility
**Problem**: Button showing even when already on game page, redundant and confusing.

**Mistake**: Not checking current route before displaying button.

**Fix**: 
```typescript
const location = useLocation();
const isOnGamePage = location.pathname.startsWith('/game/');

{!isOnGamePage && lastRoomId && (
  <button onClick={handleRejoinGame}>
    Rejoin Game
  </button>
)}
```

---

### Issue 6.5: Results Button Timing
**Problem**: Results button not appearing immediately after votes revealed.

**Mistake**: Incorrect state dependency for button visibility.

**Fix**: 
```typescript
// Updated dependency
{votesRevealed && (
  <button onClick={handleShowResults}>
    View Results
  </button>
)}
```

---

### Issue 6.6: Results Modal Missing Current Round
**Problem**: Results modal not including current round's results when opened.

**Mistake**: Not updating results state when votes revealed.

**Fix**: 
```typescript
const handleRevealVotes = () => {
  socket.emit('reveal-votes', roomId);
  
  // Save current round to results
  setRoundResults(prev => [...prev, {
    title: roundTitle,
    votes: currentVotes,
    timestamp: Date.now()
  }]);
};
```

---

### Issue 6.7: Game Name Display
**Problem**: Room ID displayed instead of game name in header, not user-friendly.

**Mistake**: Using wrong data property for display.

**Fix**: 
```typescript
// GamePage.tsx
<h1>{roomState?.gameName || 'Planning Poker'}</h1>
<p className="room-id">Room: {roomId}</p>
```

---

## 7. Data Persistence Issues

### Issue 7.1: Room Name and Username Not Persisting
**Problem**: Data from new session form not available on game page after navigation.

**Mistake**: Not implementing proper data flow between components.

**Fix**: 
```typescript
// NewSessionPage.tsx
const handleCreateRoom = () => {
  const roomData = {
    gameName,
    username,
    roomId: generateRoomId()
  };
  
  navigate(`/game/${roomData.roomId}`, {
    state: roomData
  });
};

// GamePage.tsx
const location = useLocation();
const { gameName, username } = location.state || {};
```

---

### Issue 7.2: Room URL Popup Implementation
**Problem**: Need popup for entering room URL when joining existing room.

**Mistake**: Initial implementation used direct navigation without user input.

**Fix**: 
```typescript
const [showJoinModal, setShowJoinModal] = useState(false);

const handleJoinExisting = () => {
  setShowJoinModal(true);
};

const handleJoinSubmit = (roomUrl: string) => {
  const roomId = extractRoomIdFromUrl(roomUrl);
  navigate(`/game/${roomId}`);
  setShowJoinModal(false);
};
```

---

## 8. Key Lessons Learned

### 1. React StrictMode Awareness
**Lesson**: Always account for double-mounting in development mode.
- Implement proper cleanup functions
- Test with StrictMode enabled
- Don't disable StrictMode to "fix" issues

### 2. Socket Cleanup is Critical
**Lesson**: Always implement proper cleanup functions for socket connections.
- Use useEffect cleanup return function
- Call `socket.disconnect()` explicitly
- Monitor connection counts in development

### 3. Type Safety First
**Lesson**: Use TypeScript interfaces from the beginning to avoid refactoring.
- Define types before implementation
- Use typed Socket.IO interfaces
- Avoid type casting when possible

### 4. Modular Architecture
**Lesson**: Organize code into modules early to avoid painful refactoring.
- Separate concerns from the start
- Use constants for magic strings
- Create dedicated handler files

### 5. State Management Location Matters
**Lesson**: Carefully plan state location to avoid unnecessary re-renders.
- Lift state only when necessary
- Consider component hierarchy
- Use composition over prop drilling

### 6. User Feedback is Essential
**Lesson**: Implement proper user feedback mechanisms.
- Confirmations for destructive actions
- Clear error messages
- Proper redirects after state changes

### 7. Tombstone Pattern for Deleted Resources
**Lesson**: Track recently deleted resources to prevent confusion.
- Implement TTL-based tombstones
- Check tombstones before recreation
- Provide clear feedback on deleted resources

### 8. Performance Optimization Strategies
**Lesson**: Component placement and memoization are crucial.
- Place static components high in tree
- Use React.memo judiciously
- Profile before optimizing

---

## Summary Statistics

- **Total Issues Documented**: 24
- **Categories**: 8
- **Critical Issues**: 6 (Socket connections, Room deletion, Type safety)
- **Performance Issues**: 3
- **UX Issues**: 7
- **Architecture Issues**: 3

---

**End of Document**
