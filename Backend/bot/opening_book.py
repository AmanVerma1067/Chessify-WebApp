import chess
import chess.pgn

class OpeningBook:
    def __init__(self, pgn_path="assets/openings.pgn"):
        self.moves = {}
        try:
            with open(pgn_path) as f:
                while True:
                    game = chess.pgn.read_game(f)
                    if game is None:
                        break
                    board = game.board()
                    for move in game.mainline_moves():
                        fen = board.fen()
                        if fen not in self.moves:
                            self.moves[fen] = move
                        board.push(move)
        except FileNotFoundError:
            print("Opening book not found.")

    def get_move(self, board):
        return self.moves.get(board.fen(), None)