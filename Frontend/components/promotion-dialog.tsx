// components/promotion-dialog.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import type { Square } from "chess.js"

interface PromotionDialogProps {
  isOpen: boolean
  color: "w" | "b"
  onPromote: (piece: "q" | "r" | "b" | "n") => void
  onCancel: () => void
  position: { x: number; y: number }
}

export default function PromotionDialog({
  isOpen,
  color,
  onPromote,
  onCancel,
  position
}: PromotionDialogProps) {
  const pieces = [
    { type: "q", name: "Queen" },
    { type: "r", name: "Rook" },
    { type: "b", name: "Bishop" },
    { type: "n", name: "Knight" }
  ] as const

  const getPieceImage = (type: string) => {
    return `/pieces/${color}${type}.png`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed z-50"
            style={{
              left: Math.min(position.x, window.innerWidth - 280),
              top: Math.min(position.y, window.innerHeight - 200),
            }}
          >
            <Card className="p-4 bg-gray-800/95 backdrop-blur-sm border-gray-600 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">
                Choose Promotion Piece
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {pieces.map((piece) => (
                  <motion.button
                    key={piece.type}
                    onClick={() => onPromote(piece.type)}
                    className="flex flex-col items-center p-3 rounded-lg bg-gray-700/50 hover:bg-gray-600/70 transition-colors border border-gray-600 hover:border-gray-500"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={getPieceImage(piece.type) || "/placeholder.svg"}
                      alt={piece.name}
                      className="w-12 h-12 mb-2"
                      draggable={false}
                    />
                    <span className="text-sm text-gray-200 font-medium">
                      {piece.name}
                    </span>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={onCancel}
                className="w-full mt-4 px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}