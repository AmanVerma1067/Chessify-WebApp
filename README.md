# ♟️ Chessify AI - Web Chess Application

A full-featured web-based chess application built with **Next.js (React)** on the frontend, **Flask + Stockfish** for AI moves, and a dedicated **Node.js + Socket.IO** server for real-time multiplayer. Play against an AI or challenge a friend online with live spectator support.

---

## 🌐 Live Demo

- **Frontend:** [chessify.aman1067.xyz](http://chessify.aman1067.xyz/)
- **AI Backend (Flask):** [https://chess-backend-tvdo.onrender.com](https://chess-backend-tvdo.onrender.com)
- **PvP Backend (Node):** [https://chess-pvp-qhw7.onrender.com](https://chess-pvp-qhw7.onrender.com)

---

## 🚀 Features

### 🤖 AI Mode
- Play chess against an AI opponent
- Opening moves from a real Polyglot chess opening book
- Minimax algorithm with alpha-beta pruning (depth 3)
- Stockfish engine integration for strong move analysis
- Fallback to custom Minimax if Stockfish is unavailable

### 👥 Player vs Player Mode
- Create a game and share a link — no account needed
- Second player joins via the shared URL
- Server-side move validation using `chess.js` (no cheating possible)
- Real-time move sync via WebSockets
- Live chat for both players during the game
- Spectator mode — anyone with the link beyond the two players watches live
- Spectator count shown in the navbar
- Opponent disconnection detection with on-screen notification

### 🎮 General
- Drag-and-drop and click-to-move piece interaction
- Legal move highlighting
- Pawn promotion dialog
- Material advantage indicator
- Move history in algebraic notation
- Game timers — Blitz (5 min), Rapid (10 min), Unlimited
- Resign and new game controls
- Fully responsive layout
- Dark mode only

---

## 🧠 Tech Stack

### Frontend
- ⚛️ React + Next.js 13 (App Router)
- ♟️ [`chess.js`](https://github.com/jhlywa/chess.js) for board state and move validation
- 🔌 [`socket.io-client`](https://socket.io/) for real-time PvP communication
- 🎨 Tailwind CSS + shadcn/ui components
- 🎞️ Framer Motion for animations
- 🖱️ react-dnd for drag-and-drop

### AI Backend (Flask)
- 🐍 Flask (Python 3.10+)
- ♟️ [`python-chess`](https://github.com/niklasf/python-chess) for move generation and board logic
- ⚙️ Stockfish engine (ELO 1800)
- 📘 Polyglot opening book integration
- 🔁 RESTful API (`POST /get_bot_move`)
- 🔓 CORS enabled

### PvP Backend (Node.js)
- 🟩 Node.js + Express
- 🔌 Socket.IO for WebSocket room management
- ♟️ [`chess.js`](https://github.com/jhlywa/chess.js) for server-side move validation
- 🏠 Room-based architecture (players + spectators per game)

---

## 📂 Folder Structure

```
/chessify-ai
├── Chess-AI/                    # Flask AI server
│   ├── main.py                 # Flask app + /get_bot_move endpoint
│   ├── bot/
│   │   ├── minimax.py          # Minimax with alpha-beta pruning
│   │   ├── evaluation.py       # Board evaluation logic
│   │   ├── stockfish_bot.py    # Stockfish integration
│   │   └── opening_book.py     # Polyglot opening book reader
│   ├── assets/
│   │   └── openings.pgn        # Opening book data
│   ├── stockfish/              # Stockfish binary
│   ├── requirements.txt
│   └── render.yaml
│
├── Chess-PvP/                  # Node.js real-time server
│   ├── server.js               # Socket.IO room + game logic
│   ├── db.js                   # Optional PostgreSQL event client
│   ├── schema.sql              # SQL schema + analytical queries
│   └── package.json
│
├── Frontend/                   # Next.js app
│   ├── app/
│   │   ├── page.tsx            # Landing + mode selection
│   │   └── game/[gameId]/      # Dynamic PvP game room route
│   ├── components/
│   │   ├── chess-game.tsx      # Root game component
│   │   ├── game-context.tsx    # Global state + socket logic
│   │   ├── chessboard.tsx      # Board renderer
│   │   ├── chess-piece.tsx     # Draggable pieces
│   │   ├── square.tsx          # Drop target squares
│   │   ├── bot-chat.tsx        # AI analysis + PvP live chat
│   │   ├── move-history.tsx    # Algebraic notation history
│   │   ├── game-controls.tsx   # Timer, undo, resign
│   │   ├── material-display.tsx
│   │   ├── navbar.tsx
│   │   ├── lobby.tsx           # Create/Join game UI
│   │   └── spectator-bar.tsx   # Live spectator count
│   ├── lib/
│   │   ├── pvpSocket.ts        # Socket.io-client singleton
│   │   └── utils.ts
│   └── package.json
│
└── README.md
```

---

## 🛠️ API Reference

### AI Backend — Flask

**Endpoint**
```http
POST /get_bot_move
Content-Type: application/json
```

**Request**
```json
{ "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1" }
```

**Response**
```json
{
  "move": "e7e5",
  "new_fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2"
}
```

---

### PvP Backend — Socket.IO Events

| Direction | Event | Payload | Description |
|---|---|---|---|
| Client → Server | `join-room` | `roomId` | Join or create a game room |
| Client → Server | `move` | `{ roomId, from, to, promotion }` | Submit a move |
| Client → Server | `chat` | `{ roomId, msg }` | Send a chat message |
| Server → Client | `role` | `"white" \| "black" \| "spectator"` | Assigned role on join |
| Server → Client | `opponent-joined` | — | Second player has connected |
| Server → Client | `opponent-move` | `{ from, to, promotion }` | Opponent's validated move |
| Server → Client | `move-confirmed` | `{ fen }` | Server confirms your move |
| Server → Client | `sync-board` | `fen` | Current board state on late join |
| Server → Client | `chat` | `{ text, color, timestamp }` | Incoming chat message |
| Server → Client | `spectator-count` | `number` | Updated spectator count |
| Server → Client | `opponent-disconnected` | — | Opponent left the game |

---

## 🧪 Running Locally

### AI Backend
```bash
cd Chess-AI
pip install -r requirements.txt
python main.py
# Runs on http://localhost:5000
```

### PvP Server
```bash
cd Chess-PvP
npm install
node server.js
# Runs on http://localhost:3001
```

> **Optional Persistence (PostgreSQL):**
> To persist game outcomes and individual plies for analytics, apply [`Chess-PvP/schema.sql`](Chess-PvP/schema.sql) to a Postgres database and run:
> ```bash
> PERSIST_GAMES=true DATABASE_URL="postgresql://user:password@localhost:5432/chessify" node server.js
> ```
> If `PERSIST_GAMES` is unset or false, the server runs completely in-memory.

### Frontend
```bash
cd Frontend
npm install
# Create .env.local:
# NEXT_PUBLIC_FLASK_URL=http://localhost:5000
# NEXT_PUBLIC_PVP_URL=http://localhost:3001
npm run dev
# Runs on http://localhost:3000
```

---

## 🗄️ Optional Game-Event Data Model

For game analytics and event modeling, [`Chess-PvP/schema.sql`](Chess-PvP/schema.sql) defines:
- **`moves`**: Append-only event table capturing every ply (composite PK on `game_id, ply_number`, clock snapshot, SAN, FEN).
- **`games`**: Mutable dimension/state row tracking game lifecycle, termination reasons, and outcomes.
- **Analytical Queries**: Includes reference queries for average game duration by time control, opening popularity across the first 3 plies, win rate by piece color, and move-by-move time pressure analysis using SQL window functions (`LAG()`).

---

## 🔄 Deployment

### AI Backend — Render (Python)
```yaml
# render.yaml
services:
  - type: web
    name: chess-bot-backend
    env: python
    buildCommand: "chmod +x Chess-AI/stockfish/stockfish-ubuntu-x86-64"
    startCommand: gunicorn main:app --bind 0.0.0.0:$PORT
```

### PvP Server — Render (Node)
```yaml
services:
  - type: web
    name: chess-pvp-server
    env: node
    buildCommand: cd Chess-PvP && npm install
    startCommand: cd Chess-PvP && node server.js
```

### Frontend — Vercel
- Root Directory: `Frontend`
- Install Command: `pnpm install`
- Build Command: `pnpm build`
- Output Directory: `.next`
- Environment variables: `NEXT_PUBLIC_FLASK_URL`, `NEXT_PUBLIC_PVP_URL`

---

## 🐞 Troubleshooting

- **Stockfish process crashed** — ensure the binary inside `Chess-AI/stockfish/` matches Render's Linux x86-64 architecture
- **ERR_PNPM_OUTDATED_LOCKFILE** — run `pnpm install` locally and push the updated `pnpm-lock.yaml`
- **WebSocket connection refused** — verify `NEXT_PUBLIC_PVP_URL` is set correctly in Vercel environment variables
- **Moves not syncing in PvP** — check browser console for socket connection errors; Render free tier may need a moment to wake up

---

## ✨ Future Improvements

- Adjustable AI difficulty (ELO slider)
- Random matchmaking (play vs stranger)
- Sound effects
- Save and replay games (PGN export)
- Player usernames and profiles

---

## 👨‍💻 Author

**Aman Verma**
- GitHub: [@AmanVerma1067](https://github.com/AmanVerma1067)
- LinkedIn: [linkedin.com/in/amanverma1067](https://linkedin.com/in/amanverma1067)

---

## 📜 License

MIT License
