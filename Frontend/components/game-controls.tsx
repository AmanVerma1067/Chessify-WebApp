"use client"

import { useState } from "react"
import { useGame } from "@/components/game-context"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Undo2, RefreshCw, Flag, RotateCcw } from "lucide-react"
import { formatTime } from "@/lib/utils"
import { motion } from "framer-motion"

export default function GameControls() {
  const {
    undoMove,
    resetGame,
    resignGame,
    flipBoard,
    gameState,
    playerColor,
    timeoutColor,
    game,
    timeWhite,
    timeBlack,
    gameMode,
    history,
  } = useGame()

  const [resignDialogOpen, setResignDialogOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  // Get game status message
  const getGameStatusMessage = () => {
    if (gameState === "timeout") {
      return `${timeoutColor === "w" ? "White" : "Black"} ran out of time`
    } else if (gameState === "checkmate") {
      const winner = game.turn() === "w" ? "Black" : "White"
      return `Checkmate! ${winner} wins`
    } else if (gameState === "stalemate") {
      return "Stalemate! Game drawn"
    } else if (gameState === "draw") {
      return "Draw! Game over"
    } else {
      return gameState.charAt(0).toUpperCase() + gameState.slice(1)
    }
  }

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-xl font-semibold mb-4 text-gray-100">Game Controls</h3>

      <div className="flex justify-between mb-8 p-4 bg-gray-700/50 rounded-lg">
        <div className="text-center">
          <div className="text-base text-gray-400 font-medium mb-1">White</div>
          <motion.div
            className={`text-3xl font-mono font-bold ${timeWhite < 30 && gameMode !== "unlimited" ? "text-red-400" : "text-gray-100"}`}
            animate={timeWhite < 30 && gameMode !== "unlimited" ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          >
            {formatTime(timeWhite)}
          </motion.div>
        </div>

        <div className="text-center">
          <div className="text-base text-gray-400 font-medium mb-1">Black</div>
          <motion.div
            className={`text-3xl font-mono font-bold ${timeBlack < 30 && gameMode !== "unlimited" ? "text-red-400" : "text-gray-100"}`}
            animate={timeBlack < 30 && gameMode !== "unlimited" ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          >
            {formatTime(timeBlack)}
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <Button
          variant="outline"
          onClick={() => undoMove()}
          disabled={gameState !== "playing" || history.length === 0}
          className="flex items-center text-base font-medium h-12 hover:bg-blue-600/20 transition-all duration-200"
        >
          <Undo2 className="mr-3 h-5 w-5" />
          Undo Last Move
        </Button>

        <Button
          variant="outline"
          onClick={() => flipBoard()}
          className="flex items-center text-base font-medium h-12 hover:bg-green-600/20 transition-all duration-200"
        >
          <RotateCcw className="mr-3 h-5 w-5" />
          Flip Board
        </Button>

        <Button
          variant="outline"
          onClick={() => setResetDialogOpen(true)}
          className="flex items-center text-base font-medium h-12 hover:bg-yellow-600/20 transition-all duration-200"
        >
          <RefreshCw className="mr-3 h-5 w-5" />
          New Game
        </Button>

        <Button
          variant="outline"
          onClick={() => setResignDialogOpen(true)}
          disabled={gameState !== "playing"}
          className="flex items-center text-base font-medium h-12 text-red-400 hover:text-red-300 hover:bg-red-600/20 transition-all duration-200"
        >
          <Flag className="mr-3 h-5 w-5" />
          Resign Game
        </Button>
      </div>

      <motion.div
        className="mt-8 p-4 bg-gray-700/50 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h4 className="font-semibold mb-3 text-lg text-gray-100">Game Status</h4>
        <div className="text-base space-y-2">
          <p className="text-gray-200">
            <span className="font-medium">Status:</span> <span className="ml-2">{getGameStatusMessage()}</span>
          </p>
          <p className="text-gray-200">
            <span className="font-medium">Playing as:</span>{" "}
            <span className="ml-2">{playerColor === "w" ? "White" : "Black"}</span>
          </p>
          <p className="text-gray-200">
            <span className="font-medium">Turn:</span>{" "}
            <span className="ml-2">{game.turn() === "w" ? "White" : "Black"}</span>
          </p>
        </div>
      </motion.div>

      {/* Resign Confirmation Dialog */}
      <AlertDialog open={resignDialogOpen} onOpenChange={setResignDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg text-gray-100">Are you sure you want to resign?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-300">
              This action cannot be undone. The game will end and be recorded as a loss.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-base bg-gray-700 text-gray-100 hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resignGame()
                setResignDialogOpen(false)
              }}
              className="text-base bg-red-600 hover:bg-red-700"
            >
              Resign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Game Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg text-gray-100">Start a new game?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-300">
              The current game will be abandoned and a new game will begin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-base bg-gray-700 text-gray-100 hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetGame()
                setResetDialogOpen(false)
              }}
              className="text-base bg-blue-600 hover:bg-blue-700"
            >
              New Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
