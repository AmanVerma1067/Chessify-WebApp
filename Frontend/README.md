# ♟️ Chessify AI

Chessify AI is a modern web-based chess game built with **Next.js 13+**, featuring AI-powered moves, clean UI, drag-and-drop + click-to-move functionality, and a contextual sidebar with chat, move history, and game controls.

## 🚀 Features

- 🧠 AI Opponent using custom Flask AI server (Minimax/Stockfish) with public API fallback
- 🎮 Interactive chessboard (drag & drop + click-to-move)
- 💬 Chat panel with bot move explanations
- 📋 Move history in algebraic notation
- ⏱️ Game timer and controls (undo, resign, restart)
- 📊 Material advantage indicator
- ⚡ Endgame detection (checkmate, stalemate, draw)
- 🌑 Dark mode UI only
- 📱 Fully responsive layout

## 🛠️ Tech Stack

- **Next.js 13 (App Router)**
- **React + TypeScript**
- **Tailwind CSS + Shadcn UI**
- **chess.js** for game logic
- **Framer Motion** for animations
- **Flask AI Backend + Public Fallback** for bot integration

## 📁 Project Structure

```plaintext
app/          # Pages and layouts
components/   # UI and game components
hooks/        # Custom React hooks
lib/          # Utilities and helpers
public/       # Static assets and piece images
````

## ⚙️ Setup

```bash
git clone https://github.com/your-username/chessify-ai.git
cd chessify-ai
npm install
npm run dev
```

## 📄 License

MIT © [Aman Verma](https://github.com/AmanVerma1067)
