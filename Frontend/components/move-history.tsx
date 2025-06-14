"use client"

import { useGame } from "@/components/game-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export default function MoveHistory() {
  const { history, currentMove } = useGame()

  // Group moves by pairs (white and black)
  const groupedMoves = []
  for (let i = 0; i < history.length; i += 2) {
    groupedMoves.push({
      number: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
    })
  }

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h3 className="text-xl font-semibold mb-3 text-gray-100">Move History</h3>

      <ScrollArea className="flex-grow border rounded-md p-3 bg-gray-900/50 border-gray-700">
        <div className="space-y-1">
          {groupedMoves.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-base">No moves yet</p>
          ) : (
            groupedMoves.map((moveGroup, index) => (
              <motion.div
                key={index}
                className="flex text-base hover:bg-gray-800/50 rounded px-2 py-1 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <span className="w-10 text-gray-400 font-medium flex-shrink-0">{moveGroup.number}.</span>
                <span
                  className={cn(
                    "flex-1 font-mono text-gray-200 px-2 py-1 rounded transition-colors",
                    currentMove === index * 2 + 1 && "bg-cyan-900/70 text-cyan-100",
                  )}
                >
                  {moveGroup.white?.san || ""}
                </span>
                <span
                  className={cn(
                    "flex-1 font-mono text-gray-200 px-2 py-1 rounded transition-colors",
                    currentMove === index * 2 + 2 && "bg-cyan-900/70 text-cyan-100",
                  )}
                >
                  {moveGroup.black?.san || ""}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Move count summary */}
      {history.length > 0 && (
        <div className="mt-3 p-2 bg-gray-800/30 rounded text-xs text-gray-400 text-center">
          Total moves: {history.length} | Current: {currentMove}
        </div>
      )}
    </motion.div>
  )
}
