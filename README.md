# ♟️ Chessify AI - Web Chess Bot

A web-based chess-playing application built with **Next.js (React)** on the frontend and **Flask + Stockfish** on the backend. This app lets users play against a bot that calculates moves using a combination of custom logic and the Stockfish engine.

---

## 🌐 Live Demo

- **Frontend:** [chessify.aman1067.xyz](http://chessify.aman1067.xyz/)
- **Backend API:** [https://chess-backend-tvdo.onrender.com](https://chess-backend-tvdo.onrender.com)

---

## 🚀 Features

- ✅ Play chess against an AI
- ♟️ Uses Stockfish (local or remote) for move generation
- 🎨 Interactive UI with drag-and-drop and click-to-move
- 💡 Highlights legal moves
- ⚙️ Fully responsive and modern interface
- 🌙 Dark mode support (if implemented)

---

## 🧠 Tech Stack

### Frontend
- ⚛️ React + Next.js (App Router)
- ♟️ [`chess.js`](https://github.com/jhlywa/chess.js) for board state
- 💅 TailwindCSS or CSS Modules
- 🎮 `react-chessboard` or custom board

### Backend
- 🐍 Flask (Python 3.10+)
- ♟️ [`python-chess`](https://github.com/niklasf/python-chess)
- ⚙️ Stockfish engine (ELO 1500+)
- 🔁 RESTful API (`/get_bot_move`)
- 🔓 CORS enabled for frontend communication

---

## 📂 Folder Structure

```

/chessify-ai
├── Backend/
│   ├── main.py
│   ├── bot/
│   │   ├── minimax.py
│   │   ├── stockfish\_bot.py
│   │   └── opening\_book.py
│   └── stockfish/  # includes stockfish binary
├── Frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── styles/
│   └── package.json
├── README.md

````

---

## 🛠️ Backend API

### Endpoint

```http
POST /get_bot_move
Content-Type: application/json
````

### Request Body

```json
{
  "fen": "current FEN string"
}
```

### Response

```json
{
  "move": "e2e4",
  "new_fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
}
```

---

## 🧪 Testing Backend Locally

1. Make sure `stockfish` is present inside `Backend/stockfish/`.
2. Run the backend:

```bash
cd Backend
python main.py
```

3. Test in Postman:

* URL: `http://localhost:5000/get_bot_move`
* Method: POST
* Body (JSON):

```json
{ "fen": "startpos" }
```

---

## 🔄 Deployment

### Backend (Render)

1. Push your backend folder to a GitHub repo.

2. Create a **Render Web Service**:

   * Environment: Python
   * Start Command:

     ```bash
     gunicorn main:app --bind 0.0.0.0:$PORT
     ```
   * Add `stockfish` binary to `Backend/stockfish/` and ensure `os.path.join` correctly finds it.

3. Confirm it's running at:
   `https://your-backend.onrender.com/get_bot_move`

---

### Frontend (Vercel)

1. Push the `Frontend/` folder to a separate GitHub repo (recommended).
2. Connect to [Vercel](https://vercel.com)
3. Set:

   * **Root Directory**: `Frontend`
   * **Install Command**: `pnpm install`
   * **Build Command**: `pnpm build`
   * **Output Directory**: `.next`

---

## 🐞 Troubleshooting

* `Stockfish process has crashed`: Ensure binary is compatible with Render’s OS.
* `ERR_PNPM_OUTDATED_LOCKFILE`: Run `pnpm install` locally and push the new `pnpm-lock.yaml`.

---

## ✨ Future Improvements

* Multiplayer mode via socket
* Adjustable elo bot
* Sound effects
* Save/load games

---

## 👨‍💻 Author

**Aman Verma**
GitHub: [@AmanVerma1067](https://github.com/AmanVerma1067)
LinkedIn: [linkedin](https://linkedin.com/in/amanverma1067)

---

## 📜 License

MIT License
