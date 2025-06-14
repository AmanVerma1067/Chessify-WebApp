"use client"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { useMediaQuery } from "@/hooks/use-media-query"
import Navbar from "@/components/navbar"
import Chessboard from "@/components/chessboard"
import RightPanel from "@/components/right-panel"
import Footer from "@/components/footer"
import { GameProvider } from "@/components/game-context"
import GameStatusPopup from "@/components/game-status-popup"

export default function ChessGame() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const backend = isMobile ? TouchBackend : HTML5Backend

  return (
    <DndProvider backend={backend}>
      <GameProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex flex-col md:flex-row flex-1 gap-4 p-4 max-w-7xl mx-auto w-full">
            <div className="w-full md:w-3/5">
              <Chessboard />
            </div>
            <div className="w-full md:w-2/5 mt-4 md:mt-0">
              <RightPanel />
            </div>
          </div>
          <Footer />
          <GameStatusPopup />
        </div>
      </GameProvider>
    </DndProvider>
  )
}
