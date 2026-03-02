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
  } = useGame()

  return (
    <DndProvider backend={backend}>
      <div className="flex flex-col min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex flex-col md:flex-row flex-1 gap-4 p-4 max-w-7xl mx-auto w-full">
          <div className="w-full md:w-3/5 space-y-4">
            <MaterialDisplay />
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