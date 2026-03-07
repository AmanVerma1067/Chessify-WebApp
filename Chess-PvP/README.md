# ♟️ Chess PvP — Real-Time Multiplayer Chess Server

A real-time **Player vs Player** chess server built with **Node.js**, **Express**, **Socket.IO**, and **chess.js**. Create or join rooms, play live chess against an opponent, chat in-game, and let others spectate — all powered by WebSockets.

---

## ✨ Features

- **Room-Based Matchmaking** — Create or join a game room using a unique Room ID. Share the ID with a friend to start playing instantly.
- **Real-Time Gameplay** — Moves are broadcast in real-time via WebSockets. Both players see updates instantly with no page refreshes.
- **Server-Side Move Validation** — Every move is validated on the server using [chess.js](https://github.com/jhlywa/chess.js), preventing illegal moves and out-of-turn play.
- **Role Assignment** — The first player to join a room is assigned **White**, the second gets **Black**, and any additional connections become **Spectators**.
- **Spectator Mode** — Others can watch an ongoing game live. Spectator count is broadcast to all participants.
- **In-Game Chat** — Players and spectators can send messages to everyone in the room in real-time.
- **Disconnect Handling** — When a player disconnects, the opponent and spectators are notified. Empty rooms are automatically cleaned up.
- **Reconnect-Safe** — Handles quick reconnects gracefully by cleaning up stale socket references before reassigning roles.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | JavaScript runtime |
| [Express](https://expressjs.com/) | HTTP server framework |
| [Socket.IO](https://socket.io/) | Real-time bidirectional communication |
| [chess.js](https://github.com/jhlywa/chess.js) | Chess move generation, validation & game state |
| [CORS](https://www.npmjs.com/package/cors) | Cross-Origin Resource Sharing middleware |

---

## 📁 Project Structure

```
chess-pvp/
├── server.js          # Main server — Socket.IO event handlers & game logic
├── package.json       # Project metadata & dependencies
├── package-lock.json  # Locked dependency tree
├── .gitignore         # Git ignore rules
└── README.md          # You are here!
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AmanVerma1067/chess-pvp.git
   cd chess-pvp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the server**

   ```bash
   npm start
   ```

4. The server will start on **port 3001** by default (or the port specified in the `PORT` environment variable).

   ```
   Realtime server running on port 3001
   ```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Port on which the server listens |

---

## 🔌 Socket.IO Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join-room` | `roomId` (string) | Join or create a room with the given ID |
| `move` | `{ roomId, from, to, promotion }` | Make a chess move (only valid for active players on their turn) |
| `chat` | `{ roomId, msg }` | Send a chat message to all other users in the room |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `role` | `"white"` \| `"black"` \| `"spectator"` | Assigned role upon joining a room |
| `sync-board` | FEN string | Current board state sent to newly joined users |
| `opponent-joined` | — | Emitted when both players are present |
| `opponent-move` | `{ from, to, promotion }` | Opponent's move broadcast to the other player & spectators |
| `move-confirmed` | `{ fen }` | Confirmation sent back to the player who made the move |
| `chat-received` | `msg` (string) | Chat message broadcast to all users except the sender |
| `spectator-count` | `count` (number) | Updated spectator count broadcast to the room |
| `opponent-disconnected` | — | Notification that a player has left the game |

---

## 🏗️ Architecture Overview

```
┌──────────────┐         WebSocket          ┌──────────────────┐
│   Client A   │◄──────────────────────────►│                  │
│  (White)     │                            │                  │
└──────────────┘                            │   Node.js +      │
                                            │   Express +      │
┌──────────────┐         WebSocket          │   Socket.IO      │
│   Client B   │◄──────────────────────────►│                  │
│  (Black)     │                            │   Server         │
└──────────────┘                            │                  │
                                            │  ┌────────────┐  │
┌──────────────┐         WebSocket          │  │  chess.js   │  │
│  Spectators  │◄──────────────────────────►│  │ (Validation)│  │
│              │                            │  └────────────┘  │
└──────────────┘                            └──────────────────┘
```

1. **Client connects** → Server assigns a role (White / Black / Spectator).
2. **Player makes a move** → Server validates it with `chess.js` → Broadcasts to the room.
3. **Chat messages** are relayed to all other users in the room.
4. **On disconnect** → Opponents are notified, and empty rooms are garbage-collected.

---

## 🧩 Room Data Structure

Each room is stored in-memory with the following shape:

```javascript
rooms[roomId] = {
  players: {
    white: socketId | null,   // Socket ID of the white player
    black: socketId | null    // Socket ID of the black player
  },
  spectators: [socketId],     // Array of spectator socket IDs
  fen: "rnbqkbnr/..."        // Current board state in FEN notation
};
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📝 License

This project is currently unlicensed. Consider adding a license to let others know how they can use your code.

---

## 📬 Contact

**Aman Verma** — [@AmanVerma1067](https://github.com/AmanVerma1067)

Project Link: [https://github.com/AmanVerma1067/chess-pvp](https://github.com/AmanVerma1067/chess-pvp)