"use client"

import { useState, useEffect, useRef } from "react"
import { useGame } from "@/components/game-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Bot, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

interface ChatMessage {
  id: number
  text: string
  sender: "bot" | "system"
  timestamp: Date
}

export default function BotChat() {
  // Destructure everything we need
  const { botThinking, botMessage, gameState, timeoutColor } = useGame()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const didMountRef = useRef(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 1️⃣ On first mount: show welcome once
  useEffect(() => {
    if (!didMountRef.current) {
      setMessages([
        {
          id: 0,
          text: "Hello! I'm Chessify AI v2 by Aman Verma. Ready for an enhanced chess experience?",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
      didMountRef.current = true
    }
  }, [])

  // 2️⃣ Push new botMessage (skip welcome duplication, keep last 6)
  useEffect(() => {
    if (!didMountRef.current || !botMessage) return
    if (botMessage.startsWith("Hello! I'm Chessify AI v2")) return

    setMessages((prev) => {
      const next = [
        ...prev.slice(-5), // keep last 5, +1 new = 6 total
        {
          id: prev.length,
          text: botMessage,
          sender: "bot",
          timestamp: new Date(),
        },
      ]
      return next
    })
  }, [botMessage])

  // 3️⃣ System messages on gameState changes
  useEffect(() => {
    let text: string | null = null

    if (gameState === "check") {
      text = "⛁ Check! Your king is under threat."
    } else if (gameState === "checkmate") {
      const winner = timeoutColor === "w" ? "Black" : "White"
      text = `🏁 Game Over! ${winner} wins by checkmate.`
    } else if (gameState === "stalemate") {
      text = "🚫 Draw by stalemate - no legal moves remain."
    } else if (gameState === "draw") {
      text = "🤝 Draw agreed or insufficient material."
    } else if (gameState === "timeout") {
      const loser = timeoutColor === "w" ? "White" : "Black"
      text = `⌛ Game Over! ${loser} ran out of time.`
    }

    if (text) {
      setMessages((prev) => {
        const next = [
          ...prev.slice(-5),
          {
            id: prev.length,
            text,
            sender: "system",
            timestamp: new Date(),
          },
        ]
        return next
      })
    }
  }, [gameState, timeoutColor])

  // 4️⃣ Auto-scroll only the chat viewport
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight
    }
  }, [messages, botThinking])

  // 5️⃣ Format timestamps
  const formatTimestamp = (ts: Date) => {
    const now = Date.now()
    const diff = Math.floor((now - ts.getTime()) / 1000)
    if (diff < 10) return "Just now"
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-3">
        <Bot className="h-6 w-6 text-cyan-400 mr-2" />
        <h3 className="text-xl font-semibold text-gray-100">AI Analysis</h3>
      </div>

      <ScrollArea
        ref={scrollAreaRef}
        className="flex-grow border rounded-md p-4 bg-gray-900/50 border-gray-700"
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-lg max-w-[90%] ${
                message.sender === "bot"
                  ? "ml-auto bg-gradient-to-br from-cyan-900 to-blue-800 border border-cyan-700"
                  : "bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-600"
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === "bot" ? (
                  <Bot className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-base leading-relaxed text-gray-100">{message.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {botThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
            >
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              <span className="text-base text-gray-300">AI is thinking...</span>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-3 p-2 bg-gray-800/30 rounded text-xs text-gray-400 text-center">
        Powered by Chessify AI | Depth: 8
      </div>
    </motion.div>
  )
}
