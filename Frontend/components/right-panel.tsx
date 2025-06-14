"use client"

import { motion } from "framer-motion"
import MoveHistory from "@/components/move-history"
import BotChat from "@/components/bot-chat"
import GameControls from "@/components/game-controls"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RightPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full"
    >
      <Card className="h-full bg-gray-800/90 backdrop-blur-sm shadow-lg p-4">
        <Tabs defaultValue="moves" className="h-full flex flex-col">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="moves">Moves</TabsTrigger>
            <TabsTrigger value="chat">Bot Chat</TabsTrigger>
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
