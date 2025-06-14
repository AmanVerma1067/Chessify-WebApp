from stockfish import Stockfish
import os

stockfish = Stockfish(path=os.path.join("stockfish", "stockfish-ubuntu-x86-64"))

def get_stockfish_move(board, time_limit=0.5, elo=1800):
    stockfish.set_fen_position(board.fen())
    return chess.Move.from_uci(stockfish.get_best_move())

