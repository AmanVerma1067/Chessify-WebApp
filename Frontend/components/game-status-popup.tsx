"use client"

import { useEffect, useState } from "react"
import { useGame } from "@/components/game-context"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

export default function GameStatusPopup() {
  const { gameState, timeoutColor, game } = useGame()
  const [showPopup, setShowPopup] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (gameState === "playing" || gameState === "check") {
      setShowPopup(false)
      return
    }

    let statusMessage = ""

    if (gameState === "timeout") {
      statusMessage = `${timeoutColor === "w" ? "White" : "Black"} ran out of time!`
    } else if (gameState === "checkmate") {
      const winner = game.turn() === "w" ? "Black" : "White"
      statusMessage = `Checkmate! ${winner} wins.`
    } else if (gameState === "stalemate") {
      statusMessage = "Stalemate! Game drawn."
    } else if (gameState === "draw") {
      statusMessage = "Draw! Game over."
    }

    if (statusMessage) {
      setMessage(statusMessage)
      setShowPopup(true)

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowPopup(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [gameState, timeoutColor, game])

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-8 py-6 rounded-lg shadow-lg z-50 flex items-center border border-gray-600"
        >
          <div className="text-xl font-semibold text-gray-100">{message}</div>
          <button
            onClick={() => setShowPopup(false)}
            className="ml-6 p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
