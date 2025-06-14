"use client"

import { useState, useEffect, useRef } from "react"
import { useGame } from "@/components/game-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface ChatMessage {
  id: number
  text: string
  sender: "bot" | "system"
  timestamp: Date
}

export default function BotChat() {
  const {
    botThinking,
    botMessage,
    gameState,
    timeoutColor,
    moveCount,       // 🆕 Make sure this exists
    lastUserMove,    // 🆕 Optional: Useful for contextual responses
  } = useGame()

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      text: "Hello! I'm Chessify AI by Aman Verma. Ready to challenge your skills!",
      sender: "bot",
      timestamp: new Date(),
    },
  ])

  const lastBotReplyMove = useRef(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Smarter contextual replies (every few moves)
  useEffect(() => {
    const messagesToSay = [
      "Interesting move.",
      "You're playing well!",
      "Hmm... let me think about this one.",
      "Nice development.",
      "That could get tricky for me.",
      "You're forcing me to play seriously!",
      "Solid strategy.",
    ]

    if (
      moveCount > 0 &&
      moveCount % 3 === 0 &&
      moveCount !== lastBotReplyMove.current
    ) {
      const msg = messagesToSay[Math.floor(Math.random() * messagesToSay.length)]

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length,
          text: msg,
          sender: "bot",
          timestamp: new Date(),
        },
      ])
      lastBotReplyMove.current = moveCount
    }
  }, [moveCount])

  // Game state based system messages
  useEffect(() => {
    const addSystemMsg = (text: string) =>
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length,
          text,
          sender: "system",
          timestamp: new Date(),
        },
      ])

    switch (gameState) {
      case "check":
        addSystemMsg("Check! Watch your king.")
        break
      case "checkmate":
        addSystemMsg(`Checkmate! ${timeoutColor === "w" ? "Black" : "White"} wins.`)
        break
      case "stalemate":
        addSystemMsg("Stalemate! It's a draw.")
        break
      case "draw":
        addSystemMsg("Draw! Game over.")
        break
      case "timeout":
        addSystemMsg(`Time's up! ${timeoutColor === "w" ? "White" : "Black"} ran out of time.`)
        break
    }
  }, [gameState, timeoutColor])

  // Handle bot messages passed from backend (non-frequent)
  useEffect(() => {
    if (botMessage && moveCount !== lastBotReplyMove.current) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length,
          text: botMessage,
          sender: "bot",
          timestamp: new Date(),
        },
      ])
      lastBotReplyMove.current = moveCount
    }
  }, [botMessage])

  // Auto-scroll
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, botThinking])

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-3 text-gray-100">Bot Chat</h3>

      <ScrollArea ref={scrollAreaRef} className="flex-grow border rounded-md p-4 bg-gray-900/50">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-lg max-w-[85%] ${
                message.sender === "bot" ? "bg-cyan-900 ml-auto" : "bg-gray-700"
              }`}
            >
              <p className="text-base leading-relaxed text-gray-100">{message.text}</p>
              <p className="text-sm text-gray-400 mt-2">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </motion.div>
          ))}

          {botThinking && (
            <div className="flex items-center space-x-3 p-3">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              <span className="text-base text-gray-300">Bot is thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
