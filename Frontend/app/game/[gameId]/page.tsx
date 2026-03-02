"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ChessGame from "@/components/chess-game"
import { ThemeProvider } from "@/components/theme-provider"
import { pvpSocket } from "@/lib/pvpSocket"
import { ChessIcon } from "@/components/chess-icon"
import { motion } from "framer-motion"
import { Copy, Check } from "lucide-react"

export default function GamePage() {
  const params = useParams()
  const gameId = (params.gameId as string).toUpperCase()
  const [opponentJoined, setOpponentJoined] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [socketReady, setSocketReady] = useState(false)

  useEffect(() => {
    // Disconnect any existing connection first
    if (pvpSocket.connected) {
      pvpSocket.disconnect()
    }

    pvpSocket.connect()

    pvpSocket.on("connect", () => {
      console.log("Socket connected:", pvpSocket.id)
      setSocketReady(true)
      pvpSocket.emit("join-room", gameId)
    })

    pvpSocket.on("role", (r: string) => {
      console.log("Received role:", r)
      setRole(r)
    })

    pvpSocket.on("opponent-joined", () => {
      console.log("Opponent joined!")
      setOpponentJoined(true)
    })

    pvpSocket.on("disconnect", () => {
      console.log("Socket disconnected")
      setSocketReady(false)
    })

    return () => {
      pvpSocket.off("connect")
      pvpSocket.off("role")
      pvpSocket.off("opponent-joined")
      pvpSocket.off("disconnect")
      pvpSocket.disconnect()
    }
  }, [gameId])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Still connecting
  if (!role) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4">
          <ChessIcon className="h-12 w-12 text-cyan-400 animate-pulse" />
          <p className="text-gray-300 text-lg">Connecting to room <span className="text-cyan-400 font-mono font-bold">{gameId}</span>...</p>
          <p className="text-gray-500 text-sm">Socket: {socketReady ? "✅ connected" : "⏳ connecting"}</p>
        </main>
      </ThemeProvider>
    )
  }

  // Spectator — go straight to game
  if (role === "spectator") {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <main className="min-h-screen bg-gray-900">
          <ChessGame mode="pvp" gameId={gameId} />
        </main>
      </ThemeProvider>
    )
  }

  // Black player — go straight to game (no waiting needed)
  if (role === "black") {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <main className="min-h-screen bg-gray-900">
          <ChessGame mode="pvp" gameId={gameId} />
        </main>
      </ThemeProvider>
    )
  }

  // White player waiting for opponent
  if (role === "white" && !opponentJoined) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 bg-gray-800 rounded-2xl p-10 border border-gray-700 max-w-md w-full mx-4"
          >
            <ChessIcon className="h-12 w-12 text-violet-400" />
            <h2 className="text-2xl font-bold text-white">Waiting for opponent...</h2>
            <p className="text-gray-400 text-center text-sm">
              Share this link or room code with your friend
            </p>

            <div className="bg-gray-900 rounded-lg px-6 py-3 border border-gray-600">
              <span className="text-3xl font-mono font-bold text-cyan-400 tracking-widest">{gameId}</span>
            </div>

            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>

            <div className="flex gap-2 items-center">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-gray-400 text-sm">You are White — connected as <span className="font-mono text-xs text-gray-500">{pvpSocket.id}</span></span>
            </div>
          </motion.div>
        </main>
      </ThemeProvider>
    )
  }

  // White player — opponent has joined, start game
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <main className="min-h-screen bg-gray-900">
        <ChessGame mode="pvp" gameId={gameId} />
      </main>
    </ThemeProvider>
  )
}