"use client"

import { motion, AnimatePresence } from "framer-motion"
import MoveHistory from "@/components/move-history"
import BotChat from "@/components/bot-chat"
import GameControls from "@/components/game-controls"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGame } from "@/components/game-context"
import { WifiOff } from "lucide-react"

export default function RightPanel() {
  const { gameType, opponentConnected } = useGame()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full"
    >
      {/* #10: Opponent disconnection banner */}
      <AnimatePresence>
        {gameType === "pvp" && !opponentConnected && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-900/60 border border-red-700 text-red-300 text-sm font-medium"
          >
            <WifiOff className="h-4 w-4 flex-shrink-0" />
            <span>Opponent disconnected. Waiting for reconnection…</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="h-full bg-slate-900/80 backdrop-blur-md shadow-xl border-slate-800 p-4">
        <Tabs defaultValue="moves" className="h-full flex flex-col">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="moves">Moves</TabsTrigger>
            {/* #8: Dynamic tab label */}
            <TabsTrigger value="chat">
              {gameType === "pvp" ? "Player Chat" : "Bot Chat"}
            </TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          <div className="flex-grow overflow-hidden mt-4">
            <TabsContent value="moves" className="h-full">
              <MoveHistory />
            </TabsContent>

            <TabsContent value="chat" className="h-full">
              <BotChat />
            </TabsContent>

            <TabsContent value="controls" className="h-full">
              <GameControls />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </motion.div>
  )
}
