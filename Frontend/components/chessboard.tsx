"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useGame } from "@/components/game-context"
import Square from "@/components/square"
import ChessPiece from "@/components/chess-piece"
import { Card } from "@/components/ui/card"

export default function Chessboard() {
  const { fen, gameState, lastMove, legalMoves, selectedPiece, boardFlipped, game } = useGame()
  const [board, setBoard] = useState<any[][]>([])

  useEffect(() => {
    // Parse FEN string to get board position
    const fenParts = fen.split(" ")
    const fenBoard = fenParts[0]
    const rows = fenBoard.split("/")

    const newBoard: any[][] = []

    rows.forEach((row) => {
      const boardRow: any[] = []
      for (let i = 0; i < row.length; i++) {
        const char = row[i]
        if (isNaN(Number.parseInt(char))) {
          // It's a piece
          const color = char === char.toUpperCase() ? "w" : "b"
          const type = char.toLowerCase()
          boardRow.push({ type, color })
        } else {
          // It's a number, representing empty squares
          const emptyCount = Number.parseInt(char)
          for (let j = 0; j < emptyCount; j++) {
            boardRow.push(null)
          }
        }
      }
      newBoard.push(boardRow)
    })

    setBoard(newBoard)
  }, [fen])

  // Create the 8x8 board
  const renderBoard = () => {
    const squares = []
    const currentTurn = game.turn()

    // Add file labels (a-h) at the top
    squares.push(<div key="top-spacer" className="col-start-1 row-start-1 w-6 h-6"></div>)

    for (let col = 0; col < 8; col++) {
      const fileLabel = boardFlipped ? String.fromCharCode(104 - col) : String.fromCharCode(97 + col)
      squares.push(
        <div
          key={`top-${col}`}
          className="flex items-center justify-center h-6 text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          {fileLabel}
        </div>,
      )
    }

    squares.push(<div key="top-right-spacer" className="w-6 h-6"></div>)

    // Add rank labels (1-8) on the left and the board squares
    for (let row = 0; row < 8; row++) {
      const displayRow = boardFlipped ? row : row
      const rankLabel = boardFlipped ? row + 1 : 8 - row

      // Rank label on the left
      squares.push(
        <div
          key={`left-${row}`}
          className="flex items-center justify-center w-6 text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          {rankLabel}
        </div>,
      )

      // Board squares
      for (let col = 0; col < 8; col++) {
        const displayCol = boardFlipped ? 7 - col : col
        const isWhite = (displayRow + displayCol) % 2 === 0
        const position = String.fromCharCode(97 + (boardFlipped ? 7 - col : col)) + (boardFlipped ? row + 1 : 8 - row)
        const piece =
          board[boardFlipped ? 7 - row : row] && board[boardFlipped ? 7 - row : row][boardFlipped ? 7 - col : col]

        // Check if this square is part of the last move
        const isLastMove = lastMove && (position === lastMove.from || position === lastMove.to)

        // Check if this square is in check
        const isCheck =
          gameState === "check" &&
          piece &&
          piece.type === "k" &&
          ((piece.color === "w" && fen.includes(" w ")) || (piece.color === "b" && fen.includes(" b ")))

        // Check if this square is selected
        const isSelected = position === selectedPiece

        // Check if this square is a legal move for the selected piece
        const isLegalMove = selectedPiece && legalMoves[selectedPiece]?.includes(position)

        squares.push(
          <Square
            key={`${row}-${col}`}
            isWhite={isWhite}
            position={position}
            isLastMove={isLastMove}
            isCheck={isCheck}
            isSelected={isSelected}
            isLegalMove={isLegalMove}
          >
            {piece && (
              <ChessPiece
                type={piece.type}
                color={piece.color}
                position={position}
                legalMoves={legalMoves[position] || []}
              />
            )}
          </Square>,
        )
      }

      // Rank label on the right
      squares.push(
        <div
          key={`right-${row}`}
          className="flex items-center justify-center w-6 text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          {rankLabel}
        </div>,
      )
    }

    // Add file labels (a-h) at the bottom
    squares.push(<div key="bottom-spacer" className="col-start-1 row-start-10 w-6 h-6"></div>)

    for (let col = 0; col < 8; col++) {
      const fileLabel = boardFlipped ? String.fromCharCode(104 - col) : String.fromCharCode(97 + col)
      squares.push(
        <div
          key={`bottom-${col}`}
          className="flex items-center justify-center h-6 text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          {fileLabel}
        </div>,
      )
    }

    squares.push(<div key="bottom-right-spacer" className="w-6 h-6"></div>)

    return squares
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${game.turn() === "w" ? "ring-2 ring-white/30" : "ring-2 ring-gray-800/30"} rounded-lg transition-all duration-300`}
    >
      <Card className="p-2 md:p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl border-2 border-gray-200 dark:border-gray-700">
        <div className="w-full grid grid-cols-[auto_repeat(8,minmax(0,1fr))_auto] grid-rows-[auto_repeat(8,minmax(0,1fr))_auto] gap-0">
          {renderBoard()}
        </div>
      </Card>
    </motion.div>
  )
}
