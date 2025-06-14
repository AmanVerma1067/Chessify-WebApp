import pygame
import chess
import chess.engine
from stockfish import Stockfish
from bot.minimax import find_best_move  # Your fallback bot
import os
import sys

# Initialize pygame
pygame.init()
WIDTH, HEIGHT = 640, 640
SQUARE_SIZE = WIDTH // 8
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Chess GUI")

# Colors
WHITE = (240, 217, 181)
BROWN = (181, 136, 99)
GREEN = (0, 255, 0)

# Fonts
font = pygame.font.SysFont("Arial", 24)

# Load piece images
pieces = {}
for piece in ['r', 'n', 'b', 'q', 'k', 'p']:
    pieces[piece] = pygame.transform.scale(
        pygame.image.load(f"assets/images/{piece}.png"), (SQUARE_SIZE, SQUARE_SIZE)
    )
    pieces[piece.upper()] = pygame.transform.scale(
        pygame.image.load(f"assets/images/{piece.upper()}.png"), (SQUARE_SIZE, SQUARE_SIZE)
    )

# Initialize chess board
board = chess.Board()
selected_square = None

# Setup Stockfish if available
try:
    stockfish_path = os.path.join("stockfish", "stockfish-ubuntu-x86-64")
    stockfish = Stockfish(path=stockfish_path)
    STOCKFISH_AVAILABLE = True
    print("[INFO] Stockfish is available.")
except Exception as e:
    print(f"[ERROR] Stockfish not available: {e}")
    STOCKFISH_AVAILABLE = False

def draw_board():
    colors = [WHITE, BROWN]
    for r in range(8):
        for c in range(8):
            color = colors[(r + c) % 2]
            pygame.draw.rect(screen, color, pygame.Rect(c*SQUARE_SIZE, r*SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE))
            square = chess.square(c, 7 - r)
            piece = board.piece_at(square)
            if piece:
                screen.blit(pieces[piece.symbol()], (c*SQUARE_SIZE, r*SQUARE_SIZE))

def get_square(pos):
    x, y = pos
    col = x // SQUARE_SIZE
    row = 7 - (y // SQUARE_SIZE)
    return chess.square(col, row)

def bot_move():
    if board.is_game_over():
        return

    move = None
    if STOCKFISH_AVAILABLE:
        try:
            stockfish.set_fen_position(board.fen())
            move_str = stockfish.get_best_move()
            move = chess.Move.from_uci(move_str)
            print(f"[BOT] Move by Stockfish: {move}")
        except Exception as e:
            print(f"[BOT] Stockfish failed: {e}")
    
    if not move or not board.is_legal(move):
        move = find_best_move(board, depth=2)
        print(f"[BOT] Move by Minimax fallback: {move}")
    
    board.push(move)

# Game loop
running = True
clock = pygame.time.Clock()

while running:
    draw_board()
    pygame.display.flip()

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
            break

        if event.type == pygame.MOUSEBUTTONDOWN and board.turn == chess.WHITE:
            square = get_square(pygame.mouse.get_pos())
            if selected_square is None:
                if board.piece_at(square) and board.piece_at(square).color == chess.WHITE:
                    selected_square = square
            else:
                move = chess.Move(selected_square, square)
                if move in board.legal_moves:
                    board.push(move)
                    selected_square = None
                    pygame.time.wait(500)
                    bot_move()
                else:
                    selected_square = None

    clock.tick(30)

pygame.quit()
sys.exit()
