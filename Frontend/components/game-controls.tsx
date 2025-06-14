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
import { Undo2, RefreshCw, Flag } from "lucide-react"
import { formatTime } from "@/lib/utils"

export default function GameControls() {
  const {
    undoMove,
    resetGame,
    resignGame,
    gameState,
    playerColor,
    timeoutColor,
    game,
    timeWhite,
    timeBlack,
    gameMode,
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
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4 text-gray-100">Game Controls</h3>

      <div className="flex justify-between mb-8">
        <div className="text-center">
          <div className="text-base text-gray-400 font-medium mb-1">White</div>
          <div
            className={`text-3xl font-mono font-bold ${timeWhite < 30 && gameMode !== "unlimited" ? "text-red-400" : "text-gray-100"}`}
          >
            {formatTime(timeWhite)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-base text-gray-400 font-medium mb-1">Black</div>
          <div
            className={`text-3xl font-mono font-bold ${timeBlack < 30 && gameMode !== "unlimited" ? "text-red-400" : "text-gray-100"}`}
          >
            {formatTime(timeBlack)}
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <Button
          variant="outline"
          onClick={() => undoMove()}
          disabled={gameState !== "playing"}
          className="flex items-center text-base font-medium h-12"
        >
          <Undo2 className="mr-3 h-5 w-5" />
          Undo Move
        </Button>

        <Button
          variant="outline"
          onClick={() => setResetDialogOpen(true)}
          className="flex items-center text-base font-medium h-12"
        >
          <RefreshCw className="mr-3 h-5 w-5" />
          New Game
        </Button>

        <Button
          variant="outline"
          onClick={() => setResignDialogOpen(true)}
          disabled={gameState !== "playing"}
          className="flex items-center text-base font-medium h-12 text-red-400 hover:text-red-300"
        >
          <Flag className="mr-3 h-5 w-5" />
          Resign
        </Button>
      </div>

      <div className="mt-8 p-4 bg-gray-700 rounded-md">
        <h4 className="font-semibold mb-3 text-lg text-gray-100">Game Status</h4>
        <div className="text-base space-y-2">
          <p className="text-gray-200">
            <span className="font-medium">Status:</span> <span className="ml-2">{getGameStatusMessage()}</span>
          </p>
          <p className="text-gray-200">
            <span className="font-medium">Playing as:</span>{" "}
            <span className="ml-2">{playerColor === "w" ? "White" : "Black"}</span>
          </p>
        </div>
      </div>

      {/* Resign Confirmation Dialog */}
      <AlertDialog open={resignDialogOpen} onOpenChange={setResignDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Are you sure you want to resign?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This action cannot be undone. The game will end and be recorded as a loss.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-base">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resignGame()
                setResignDialogOpen(false)
              }}
              className="text-base"
            >
              Resign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Game Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Start a new game?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              The current game will be abandoned and a new game will begin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-base">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetGame()
                setResetDialogOpen(false)
              }}
              className="text-base"
            >
              New Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
