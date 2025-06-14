from flask import Flask, request, jsonify
import chess
from bot.minimax import find_best_move
from bot.opening_book import OpeningBook
from bot.stockfish_bot import get_stockfish_move
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
book = OpeningBook()

@app.route("/get_bot_move", methods=["POST"])
def get_bot_move():
    data = request.json
    if not data or "fen" not in data:
        return jsonify({"error": "FEN not provided"}), 400

    fen = data["fen"]
    board = chess.Board(fen)

    move = None
    if board.fullmove_number <= 10:
        move = book.get_move(board)
    if move is None:
        move = get_stockfish_move(board, time_limit=0.5, elo=1800)
    if move is None:
        move = find_best_move(board, depth=3)

    board.push(move)

    response = {
        "move": move.uci(),
        "new_fen": board.fen()
    }

    return jsonify(response)

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)

