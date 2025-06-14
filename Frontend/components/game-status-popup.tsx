"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useGame } from "@/components/game-context"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trophy, Handshake, Clock } from "lucide-react"

export default function GameStatusPopup() {
  const { gameState, timeoutColor, game } = useGame()
  const [showPopup, setShowPopup] = useState(false)
  const [message, setMessage] = useState("")
  const [icon, setIcon] = useState<React.ReactNode>(null)

  useEffect(() => {
    if (gameState === "playing" || gameState === "check") {
      setShowPopup(false)
      return
    }

    let statusMessage = ""
    let statusIcon = null

    if (gameState === "timeout") {
      statusMessage = `Time's Up! ${timeoutColor === "w" ? "White" : "Black"} ran out of time`
      statusIcon = <Clock className="h-8 w-8 text-red-400" />
    } else if (gameState === "checkmate") {
      const winner = game.turn() === "w" ? "Black" : "White"
      statusMessage = `Checkmate! ${winner} wins the game`
      statusIcon = <Trophy className="h-8 w-8 text-yellow-400" />
    } else if (gameState === "stalemate") {
      statusMessage = "Stalemate! The game is a draw"
      statusIcon = <Handshake className="h-8 w-8 text-blue-400" />
    } else if (gameState === "draw") {
      statusMessage = "Draw! The game ends in a tie"
      statusIcon = <Handshake className="h-8 w-8 text-blue-400" />
    }

    if (statusMessage) {
      setMessage(statusMessage)
      setIcon(statusIcon)
      setShowPopup(true)

      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setShowPopup(false)
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [gameState, timeoutColor, game])

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-6 rounded-xl shadow-2xl border border-gray-600 flex items-center space-x-4 max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {icon}
            </motion.div>

            <div className="flex-1">
              <div className="text-xl font-bold text-gray-100 mb-1">Game Over</div>
              <div className="text-base text-gray-300">{message}</div>
            </div>

            <motion.button
              onClick={() => setShowPopup(false)}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={24} className="text-gray-400" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
