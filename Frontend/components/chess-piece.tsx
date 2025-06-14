"use client"

import { useDrag } from "react-dnd"
import { useGame } from "@/components/game-context"
import { motion } from "framer-motion"
import type { Square } from "chess.js"

interface ChessPieceProps {
  type: string
  color: string
  position: string
  legalMoves: Square[]
}

export default function ChessPiece({ type, color, position, legalMoves }: ChessPieceProps) {
  const { playerColor, gameState, selectPiece } = useGame()

  // Only allow dragging if it's the player's turn and the game is still active
  const canDrag = color === playerColor && gameState === "playing"

  const [{ isDragging }, drag] = useDrag({
    type: "piece",
    item: { type, color, position },
    canDrag: () => canDrag,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  // Get piece image URL
  const getPieceImage = () => {
    // Using the naming convention: [color][type].png
    // Example: wp.png for white pawn, bk.png for black king
    return `/pieces/${color}${type}.png`
  }

  return (
    <motion.div
      ref={drag}
      className={`w-full h-full flex items-center justify-center ${
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      } ${isDragging ? "opacity-50" : "opacity-100"}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 15,
        opacity: { duration: 0.2 },
      }}
      whileHover={
        canDrag
          ? {
              scale: 1.1,
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
              transition: { duration: 0.2 },
            }
          : {}
      }
      whileTap={canDrag ? { scale: 0.95 } : {}}
      style={{ touchAction: "none" }}
      layout
    >
      <motion.img
        src={getPieceImage() || "/placeholder.svg"}
        alt={`${color === "w" ? "White" : "Black"} ${type}`}
        className="w-[85%] h-[85%] select-none filter drop-shadow-sm"
        draggable={false}
        initial={{ rotate: 0 }}
        animate={{ rotate: isDragging ? 5 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  )
}
