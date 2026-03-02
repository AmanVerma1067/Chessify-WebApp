"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ChessGame from "@/components/chess-game"
import { ThemeProvider } from "@/components/theme-provider"
import { ChessIcon } from "@/components/chess-icon"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

type Screen = "landing" | "pvp-lobby" | "ai-game"

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing")
  const [joinCode, setJoinCode] = useState("")
  const router = useRouter()

  const createGame = () => {
    const roomId = Math.random().toString(36).substr(2, 6).toUpperCase()
    router.push(`/game/${roomId}`)
  }

  const joinGame = () => {
    if (joinCode.trim()) {
      router.push(`/game/${joinCode.trim().toUpperCase()}`)
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <main className="min-h-screen bg-gray-900 transition-colors duration-300">
        {screen === "ai-game" ? (
          <ChessGame mode="ai" />
        ) : screen === "landing" ? (
          <div className="flex flex-col items-center justify-center min-h-screen gap-8">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-3"
            >
              <ChessIcon className="h-16 w-16 text-cyan-400" />
              <h1 className="text-5xl font-bold text-white tracking-tight">Chessify AI</h1>
              <p className="text-gray-400 text-lg">Choose your game mode</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-4 w-64"
            >
              <Button
                onClick={() => setScreen("ai-game")}
                className="h-14 text-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
              >
                🤖 Play vs AI
              </Button>
              <Button
                onClick={() => setScreen("pvp-lobby")}
                className="h-14 text-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold"
              >
                👥 Play vs Friend
              </Button>
            </motion.div>
          </div>
        ) : (
          // PvP Lobby
          <div className="flex flex-col items-center justify-center min-h-screen gap-8">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-2"
            >
              <ChessIcon className="h-12 w-12 text-violet-400" />
              <h2 className="text-4xl font-bold text-white">Play vs Friend</h2>
              <p className="text-gray-400">Create a room or join with a code</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col gap-6 w-72 bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <Button
                onClick={createGame}
                className="h-12 text-base bg-violet-600 hover:bg-violet-500 text-white font-semibold"
              >
                ✨ Create Game
              </Button>

              <div className="flex flex-col gap-2">
                <p className="text-gray-400 text-sm text-center">— or join with a code —</p>
                <input
                  type="text"
                  placeholder="Enter room code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && joinGame()}
                  maxLength={6}
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 text-center font-mono text-lg tracking-widest focus:outline-none focus:border-violet-500"
                />
                <Button
                  onClick={joinGame}
                  disabled={joinCode.length < 4}
                  className="h-12 text-base bg-gray-600 hover:bg-gray-500 text-white font-semibold disabled:opacity-40"
                >
                  🚪 Join Game
                </Button>
              </div>

              <button
                onClick={() => setScreen("landing")}
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                ← Back
              </button>
            </motion.div>
          </div>
        )}
      </main>
    </ThemeProvider>
  )
}