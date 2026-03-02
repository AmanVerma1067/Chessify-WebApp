"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ChessGame from "@/components/chess-game"
import { ThemeProvider } from "@/components/theme-provider"
import { ChessIcon } from "@/components/chess-icon"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

type Screen = "landing" | "pvp-lobby" | "ai-game"

// Subtle chess-board SVG pattern as a data URI
const CHESS_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='40' height='40' fill='%23ffffff08'/%3E%3Crect x='40' y='40' width='40' height='40' fill='%23ffffff08'/%3E%3C/svg%3E")`

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
      <main
        className="min-h-screen transition-colors duration-300 bg-slate-950 text-slate-100"
        style={{
          backgroundImage: `${CHESS_PATTERN}, radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 100%)`,
        }}
      >
        {screen === "ai-game" ? (
          <ChessGame mode="ai" />
        ) : screen === "landing" ? (
          /* ── LANDING ── */
          <div className="flex flex-col items-center justify-center min-h-screen gap-10 px-4">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-slate-500/10 blur-xl scale-150" />
                <ChessIcon className="relative h-20 w-20 text-slate-200 drop-shadow-sm" />
              </div>
              <h1 className="text-6xl font-extrabold text-slate-50 tracking-tight drop-shadow-sm">
                Chessify
              </h1>
              <p className="text-slate-400 text-lg max-w-xs leading-relaxed">
                Play Chess. Master Strategy.<br />
                <span className="text-gray-500 text-sm">Challenge the AI or battle a friend head-to-head.</span>
              </p>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-col gap-4 w-72 mt-2"
            >
              <Button
                onClick={() => setScreen("ai-game")}
                className="h-14 text-lg bg-slate-100 hover:bg-white text-slate-900 font-semibold shadow-md shadow-white/5 transition-all duration-200"
              >
                Play vs AI
              </Button>
              <Button
                onClick={() => setScreen("pvp-lobby")}
                variant="outline"
                className="h-14 text-lg bg-slate-900/50 hover:bg-slate-800 border-slate-700 text-slate-200 font-semibold transition-all duration-200"
              >
                Play vs Friend
              </Button>
            </motion.div>

            {/* Footer hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-gray-600 text-xs"
            >
              Powered by Stockfish · Built by Aman Verma
            </motion.p>
          </div>
        ) : (
          /* ── PVP LOBBY ── */
          <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-4">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="relative mb-1">
                <div className="absolute inset-0 rounded-full bg-slate-500/10 blur-xl scale-150" />
                <ChessIcon className="relative h-14 w-14 text-slate-300 drop-shadow-sm" />
              </div>
              <h2 className="text-4xl font-bold text-slate-50 tracking-tight">Play vs Friend</h2>
              <p className="text-slate-400 text-sm">Create a room or join with a code</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex flex-col gap-6 w-80 rounded-2xl p-7 border border-slate-800 shadow-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(2,6,23,0.95) 100%)",
                backdropFilter: "blur(16px)",
              }}
            >
              <Button
                onClick={createGame}
                className="h-13 py-3 text-base bg-slate-100 hover:bg-white text-slate-900 font-medium shadow-sm transition-all duration-200"
              >
                Create New Room
              </Button>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-800" />
                  <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">or join</p>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>
                <input
                  type="text"
                  placeholder="XXXXXX"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && joinGame()}
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-600 text-center font-mono text-2xl tracking-[0.4em] focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all"
                />
                <Button
                  onClick={joinGame}
                  disabled={joinCode.length < 4}
                  className="py-3 text-base bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 disabled:opacity-40 transition-all duration-200"
                >
                  Join Room
                </Button>
              </div>

              <button
                onClick={() => setScreen("landing")}
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors flex items-center justify-center gap-1"
              >
                ← Back to home
              </button>
            </motion.div>
          </div>
        )}
      </main>
    </ThemeProvider>
  )
}