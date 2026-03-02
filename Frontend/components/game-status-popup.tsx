"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useGame } from "@/components/game-context"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trophy, Handshake, Clock, RefreshCw, Home } from "lucide-react"
import { useRouter } from "next/navigation"

export default function GameStatusPopup() {
  const { gameState, timeoutColor, game, resetGame, gameType } = useGame()
  const [showPopup, setShowPopup] = useState(false)
  const [message, setMessage] = useState("")
  const [icon, setIcon] = useState<React.ReactNode>(null)
  const router = useRouter()

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
    }
  }, [gameState, timeoutColor, game])

  const handleRematch = () => {
    if (gameType === "pvp") {
      // In PvP, navigate home so a new room can be created
      router.push("/")
    } else {
      resetGame()
      setShowPopup(false)
    }
  }

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-6 rounded-xl shadow-2xl border border-gray-600 flex flex-col items-center gap-4 max-w-sm w-full">
            <div className="flex items-center gap-4 w-full">
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
                className="p-2 rounded-full hover:bg-gray-700 transition-colors self-start"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} className="text-gray-400" />
              </motion.button>
            </div>

            {/* #13: Rematch / New Game button */}
            <div className="flex gap-3 w-full">
              <motion.button
                onClick={handleRematch}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors"
              >
                {gameType === "pvp" ? (
                  <><Home className="h-4 w-4" /> New Room</>
                ) : (
                  <><RefreshCw className="h-4 w-4" /> Play Again</>
                )}
              </motion.button>
              <motion.button
                onClick={() => router.push("/")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm transition-colors"
              >
                <Home className="h-4 w-4" /> Home
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
