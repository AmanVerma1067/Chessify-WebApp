"use client"

import type React from "react"
import { useDrop } from "react-dnd"
import { useGame } from "@/components/game-context"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

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

  // Green and white chess board colors
  const lightSquareColor = "bg-green-100 dark:bg-green-200"
  const darkSquareColor = "bg-green-600 dark:bg-green-700"

  return (
    <motion.div
      ref={drop}
      className={cn(
        "relative w-full h-0 pb-[100%] flex items-center justify-center cursor-pointer transition-all duration-200",
        isWhite ? lightSquareColor : darkSquareColor,
        isLastMove && "ring-inset ring-4 ring-yellow-400 shadow-lg",
        isCheck && "ring-inset ring-4 ring-red-500 shadow-lg animate-pulse",
        isSelected && "ring-inset ring-4 ring-blue-500 shadow-xl scale-105",
        isOver && canDrop && "bg-emerald-300/70 scale-105",
        "hover:brightness-110 hover:scale-[1.02]",
      )}
      data-position={position}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>

      {/* Legal move indicator - enhanced with animation */}
      {isLegalMove && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.div
            className="w-5 h-5 rounded-full bg-blue-500/70 border-2 border-blue-600/90 shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
        </motion.div>
      )}

      {/* Selected square shadow effect */}
      {isSelected && <div className="absolute inset-0 bg-blue-500/20 rounded-sm shadow-inner pointer-events-none" />}
    </motion.div>
  )
}
