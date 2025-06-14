"use client"

import type React from "react"

import { useDrop } from "react-dnd"
import { useGame } from "@/components/game-context"
import { cn } from "@/lib/utils"

interface SquareProps {
  isWhite: boolean
  position: string
  children: React.ReactNode
  isLastMove?: boolean
  isCheck?: boolean
  isSelected?: boolean
  isLegalMove?: boolean
}

export default function Square({
  isWhite,
  position,
  children,
  isLastMove = false,
  isCheck = false,
  isSelected = false,
  isLegalMove = false,
}: SquareProps) {
  const { makeMove, selectPiece, selectedPiece, playerColor, game } = useGame()

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "piece",
    drop: (item: { position: string }) => {
      makeMove(item.position as any, position as any)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  })

  // Handle click for click-to-move functionality
  const handleClick = () => {
    const piece = game.get(position as any)

    // If a piece is already selected
    if (selectedPiece) {
      // If clicking on a legal move square, make the move
      if (isLegalMove) {
        makeMove(selectedPiece as any, position as any)
      }
      // If clicking on the same piece, deselect it
      else if (selectedPiece === position) {
        selectPiece(null)
      }
      // If clicking on another piece of the same color, select that piece instead
      else if (piece && piece.color === playerColor) {
        selectPiece(position as any)
      }
      // If clicking elsewhere, deselect the current piece
      else {
        selectPiece(null)
      }
    }
    // If no piece is selected and clicking on a piece of the player's color
    else if (piece && piece.color === playerColor) {
      selectPiece(position as any)
    }
  }

  // Classic chess board colors
  const lightSquareColor = "bg-[#f0d9b5]"
  const darkSquareColor = "bg-[#b58863]"

  return (
    <div
      ref={drop}
      className={cn(
        "relative w-full h-0 pb-[100%] flex items-center justify-center cursor-pointer",
        isWhite ? lightSquareColor : darkSquareColor,
        isLastMove && "ring-inset ring-2 ring-yellow-400",
        isCheck && "ring-inset ring-2 ring-red-500",
        isSelected && "ring-inset ring-2 ring-blue-500",
        isOver && canDrop && "bg-green-300/50",
        "transition-colors duration-200",
        "hover:brightness-110",
      )}
      data-position={position}
      onClick={handleClick}
    >
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>

      {/* Legal move indicator - properly centered */}
      {isLegalMove && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-blue-500/60 border-2 border-blue-600/80"></div>
        </div>
      )}
    </div>
  )
}
