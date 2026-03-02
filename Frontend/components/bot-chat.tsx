"use client"

import { useState, useEffect, useRef } from "react"
import { useGame } from "@/components/game-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Bot, AlertCircle, Send, Users } from "lucide-react"
import { motion } from "framer-motion"

interface ChatMessage {
  id: number
  text: string
  sender: "bot" | "system" | "pvp"
  color?: string
  timestamp: Date
}

export default function BotChat() {
  const { botThinking, botMessage, gameState, timeoutColor, gameType, pvpChatMessages, sendChat, assignedColor } = useGame()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pvpInput, setPvpInput] = useState("")
  const didMountRef = useRef(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // AI mode init
  useEffect(() => {
    if (gameType === "ai" && !didMountRef.current) {
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
  }, [gameType])

  // AI bot messages
  useEffect(() => {
    if (gameType !== "ai" || !didMountRef.current || !botMessage) return
    if (botMessage.startsWith("Hello! I'm Chessify AI v2")) return
    setMessages((prev) => [
      ...prev.slice(-5),
      { id: prev.length, text: botMessage, sender: "bot", timestamp: new Date() },
    ])
  }, [botMessage, gameType])

  // AI game state messages
  useEffect(() => {
    if (gameType !== "ai") return
    let text: string | null = null
    if (gameState === "check") text = "⛁ Check! Your king is under threat."
    else if (gameState === "checkmate") {
      const winner = timeoutColor === "w" ? "Black" : "White"
      text = `🏁 Game Over! ${winner} wins by checkmate.`
    } else if (gameState === "stalemate") text = "🚫 Draw by stalemate - no legal moves remain."
    else if (gameState === "draw") text = "🤝 Draw agreed or insufficient material."
    else if (gameState === "timeout") {
      const loser = timeoutColor === "w" ? "White" : "Black"
      text = `⌛ Game Over! ${loser} ran out of time.`
    }

    if (text) {
      setMessages((prev) => [
        ...prev.slice(-5),
        { id: prev.length, text, sender: "system", timestamp: new Date() },
      ])
    }
  }, [gameState, timeoutColor, gameType])

  // PvP chat messages from socket
  useEffect(() => {
    if (gameType !== "pvp") return
    if (pvpChatMessages.length === 0) return
    const last = pvpChatMessages[pvpChatMessages.length - 1]
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length,
        text: last.text,
        sender: "pvp",
        color: last.color,
        timestamp: new Date(last.timestamp),
      },
    ])
  }, [pvpChatMessages, gameType])

  // Auto-scroll
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null
    if (viewport) viewport.scrollTop = viewport.scrollHeight
  }, [messages, botThinking])

  const formatTimestamp = (ts: Date) => {
    const diff = Math.floor((Date.now() - ts.getTime()) / 1000)
    if (diff < 10) return "Just now"
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getSenderLabel = (color?: string) => {
    if (color === "w") return "White"
    if (color === "b") return "Black"
    return "Spectator"
  }

  const handleSendChat = () => {
    if (!pvpInput.trim()) return
    sendChat(pvpInput.trim())
    setPvpInput("")
  }

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-3">
        {gameType === "pvp" ? (
          <Users className="h-6 w-6 text-slate-300 mr-2" />
        ) : (
          <Bot className="h-6 w-6 text-slate-300 mr-2" />
        )}
        <h3 className="text-xl font-semibold text-slate-100">
          {gameType === "pvp" ? "Player Chat" : "AI Analysis"}
        </h3>
      </div>

      <ScrollArea
        ref={scrollAreaRef}
        className="flex-grow border rounded-md p-4 bg-slate-900/50 border-slate-800"
      >
        <div className="space-y-4">
          {messages.length === 0 && gameType === "pvp" && (
            <p className="text-slate-500 text-center text-sm py-4">
              Chat with your opponent here!
            </p>
          )}
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-lg max-w-[90%] ${message.sender === "bot"
                ? "ml-auto bg-slate-800 border border-slate-700"
                : message.sender === "pvp"
                  ? message.color === assignedColor
                    ? "ml-auto bg-slate-700 border border-slate-600"
                    : "bg-slate-800 border border-slate-700"
                  : "bg-slate-800/80 border border-slate-700"
                }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === "pvp" ? (
                  <Users className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                ) : message.sender === "bot" ? (
                  <Bot className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  {message.sender === "pvp" && (
                    <p className="text-xs text-slate-400 mb-0.5 font-medium">
                      {getSenderLabel(message.color)}
                    </p>
                  )}
                  <p className="text-base leading-relaxed text-slate-100">{message.text}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatTimestamp(message.timestamp)}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {botThinking && gameType === "ai" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700"
            >
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              <span className="text-base text-slate-300">AI is thinking...</span>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {gameType === "pvp" ? (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder={assignedColor === "spectator" ? "Spectating — type to chat..." : "Type a message..."}
            value={pvpInput}
            onChange={(e) => setPvpInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
            className="flex-1 px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-slate-500"
          />
          <button
            onClick={handleSendChat}
            disabled={!pvpInput.trim()}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-100 rounded-md transition-colors border border-slate-600"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="mt-3 p-2 bg-slate-800/50 rounded text-xs text-slate-400 text-center border border-slate-700">
          Powered by Chessify AI | Depth: 3
        </div>
      )}
    </motion.div>
  )
}