import chess
from bot.evaluation import evaluate_board
import time
import random

transposition_table = {}

def minimax(board, depth, alpha, beta, maximizing):
    key = board.fen()
    if key in transposition_table and transposition_table[key]["depth"] >= depth:
        return transposition_table[key]["value"]

    if depth == 0 or board.is_game_over():
        eval_score = quiescence(board, alpha, beta, maximizing)
        transposition_table[key] = {"depth": depth, "value": eval_score}
        return eval_score

    best_value = float('-inf') if maximizing else float('inf')
    for move in board.legal_moves:
        board.push(move)
        value = minimax(board, depth - 1, alpha, beta, not maximizing)
        board.pop()

        if maximizing:
            best_value = max(best_value, value)
            alpha = max(alpha, best_value)
        else:
            best_value = min(best_value, value)
            beta = min(beta, best_value)

        if beta <= alpha:
            break

    transposition_table[key] = {"depth": depth, "value": best_value}
    return best_value

def quiescence(board, alpha, beta, maximizing):
    stand_pat = evaluate_board(board)
    if maximizing:
        if stand_pat >= beta:
            return beta
        if alpha < stand_pat:
            alpha = stand_pat
    else:
        if stand_pat <= alpha:
            return alpha
        if beta > stand_pat:
            beta = stand_pat

    for move in board.generate_legal_captures():
        board.push(move)
        score = quiescence(board, alpha, beta, not maximizing)
        board.pop()

        if maximizing:
            if score >= beta:
                return beta
            if score > alpha:
                alpha = score
        else:
            if score <= alpha:
                return alpha
            if score < beta:
                beta = score

    return alpha if maximizing else beta

def find_best_move(board, depth=3):
    best_move = None
    best_value = float('-inf') if board.turn else float('inf')
    for move in board.legal_moves:
        board.push(move)
        value = minimax(board, depth - 1, float('-inf'), float('inf'), not board.turn)
        board.pop()
        if (board.turn and value > best_value) or (not board.turn and value < best_value) or best_move is None:
            best_value = value
            best_move = move
    return best_move