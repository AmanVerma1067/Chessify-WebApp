"use client"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { useMediaQuery } from "@/hooks/use-media-query"
import Navbar from "@/components/navbar"
import Chessboard from "@/components/chessboard"
import RightPanel from "@/components/right-panel"
import Footer from "@/components/footer"
import MaterialDisplay from "@/components/material-display"
import { GameProvider, useGame } from "@/components/game-context"
import GameStatusPopup from "@/components/game-status-popup"
import PromotionDialog from "@/components/promotion-dialog"

interface ChessGameProps {
  mode?: "ai" | "pvp"
  gameId?: string
}

function ChessGameContent() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const backend = isMobile ? TouchBackend : HTML5Backend

  const {
    showPromotionDialog,
    pendingPromotion,
    playerColor,
    handlePromotion,
    cancelPromotion,
    game,
    gameType,
    assignedColor,
  } = useGame()

  const currentTurn = game.turn() // 'w' or 'b'
  const isMyTurn = gameType === "pvp" && assignedColor === currentTurn
  const turnLabel = currentTurn === "w" ? "White" : "Black"

  return (
    <DndProvider backend={backend}>
      <div className="flex flex-col min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex flex-col md:flex-row flex-1 gap-4 p-4 max-w-7xl mx-auto w-full">
          <div className="w-full md:w-3/5 space-y-4">
            <MaterialDisplay />

            {/* PvP turn indicator */}
            {gameType === "pvp" && (
              <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg border transition-colors duration-300 ${isMyTurn
                  ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                  : "bg-slate-800/60 border-slate-700 text-slate-400"
                }`}>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${isMyTurn ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                  <span className="text-sm font-medium">
                    {assignedColor === "spectator"
                      ? `${turnLabel}'s turn`
                      : isMyTurn
                        ? "Your Turn"
                        : "Opponent's Turn"}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {assignedColor === "w" ? "You: White" : assignedColor === "b" ? "You: Black" : "Spectating"}
                </span>
              </div>
            )}

            <Chessboard />
          </div>
          <div className="w-full md:w-2/5 mt-4 md:mt-0">
            <RightPanel />
          </div>
        </div>
        <Footer />
        <GameStatusPopup />
        <PromotionDialog
          isOpen={showPromotionDialog}
          color={playerColor}
          onPromote={handlePromotion}
          onCancel={cancelPromotion}
          position={pendingPromotion?.position || { x: 0, y: 0 }}
        />
      </div>
    </DndProvider>
  )
}

export default function ChessGame({ mode = "ai", gameId }: ChessGameProps) {
  return (
    <GameProvider mode={mode} gameId={gameId}>
      <ChessGameContent />
    </GameProvider>
  )
}