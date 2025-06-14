"use client"

import { useGame } from "@/components/game-context"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function MaterialDisplay() {
  const { game } = useGame()

  // Calculate material values
  const calculateMaterial = () => {
    const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
    let whiteScore = 0
    let blackScore = 0

    const board = game.board()
    board.forEach((row) => {
      row.forEach((square) => {
        if (square) {
          const value = pieceValues[square.type as keyof typeof pieceValues]
          if (square.color === "w") {
            whiteScore += value
          } else {
            blackScore += value
          }
        }
      })
    })

    const advantage = whiteScore - blackScore
    return { whiteScore, blackScore, advantage }
  }

  const { whiteScore, blackScore, advantage } = calculateMaterial()

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <Card className="p-4 bg-gray-800/90 backdrop-blur-sm border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-sm text-gray-400 font-medium">White</div>
            <div className="text-xl font-bold text-gray-100">{whiteScore}</div>
          </div>

          <div className="text-center px-4">
            <div className="text-sm text-gray-400 font-medium">Material</div>
            <div
              className={`text-lg font-bold ${
                advantage > 0 ? "text-green-400" : advantage < 0 ? "text-red-400" : "text-gray-300"
              }`}
            >
              {advantage > 0 ? `+${advantage}` : advantage < 0 ? `${advantage}` : "Equal"}
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-400 font-medium">Black</div>
            <div className="text-xl font-bold text-gray-100">{blackScore}</div>
          </div>
        </div>

        {advantage !== 0 && (
          <div className="mt-2 text-center text-sm">
            <span className={`font-medium ${advantage > 0 ? "text-green-400" : "text-red-400"}`}>
              {advantage > 0 ? "White" : "Black"} is ahead by {Math.abs(advantage)} points
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
