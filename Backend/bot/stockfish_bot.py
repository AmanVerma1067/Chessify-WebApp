import chess.engine

def get_stockfish_move(board, time_limit=0.5, elo=1800):
    try:
        with chess.engine.SimpleEngine.popen_uci("/usr/games/stockfish") as engine:
            # adjust the path to Stockfish binary for your server (can be /usr/local/bin/stockfish etc.)
            result = engine.play(board, chess.engine.Limit(time=time_limit))
            return result.move
    except Exception as e:
        print("Stockfish error:", e)
        return None
