import chess.pgn

openings = [
    {
        "name": "Ruy Lopez",
        "moves": ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"],
        "eco": "C60"
    },
    {
        "name": "Sicilian Defense",
        "moves": ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6"],
        "eco": "B50"
    },
    {
        "name": "Queen's Gambit Declined",
        "moves": ["d4", "d5", "c4", "e6", "Nc3", "Nf6"],
        "eco": "D30"
    },
    {
        "name": "Italian Game",
        "moves": ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"],
        "eco": "C50"
    },
    {
        "name": "King's Indian Defense",
        "moves": ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6"],
        "eco": "E60"
    },
]

with open("assets/openings.pgn", "w") as f:
    for opening in openings:
        game = chess.pgn.Game()
        node = game
        board = game.board()
        
        for move_san in opening["moves"]:
            move = board.parse_san(move_san)
            board.push(move)
            node = node.add_variation(move)
            
        game.headers["Event"] = "Opening Book"
        game.headers["White"] = "White"
        game.headers["Black"] = "Black"
        game.headers["Result"] = "*"
        game.headers["ECO"] = opening["eco"]
        game.headers["Opening"] = opening["name"]
        
        print(game, file=f, end="\n\n")