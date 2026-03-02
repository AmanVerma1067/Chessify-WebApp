"use client"
import { useGame } from "@/components/game-context"
import { ChessIcon } from "@/components/chess-icon"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatTime } from "@/lib/utils"

export default function Navbar() {
  const { gameMode, setGameMode, timeWhite, timeBlack, gameType } = useGame()

  return (
    <nav className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <ChessIcon className="h-8 w-8 text-slate-100" />
            <span className="ml-3 text-2xl font-bold text-slate-50 tracking-tight">Chessify</span>
          </div>

          <div className="flex items-center space-x-6">
            {/* Timer — hidden in PvP (not server-synced) */}
            {gameType === "ai" && (
              <div className="hidden md:flex items-center space-x-4 text-base text-gray-200 font-medium">
                <span>White: {formatTime(timeWhite)}</span>
                <span className="text-gray-400">|</span>
                <span>Black: {formatTime(timeBlack)}</span>
              </div>
            )}

            {/* Game mode selector — locked in PvP */}
            {gameType === "ai" ? (
              <div className="relative">
                <Select value={gameMode} onValueChange={(value) => setGameMode(value as "blitz" | "rapid" | "unlimited")}>
                  <SelectTrigger className="w-[140px] text-base font-medium bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Game Mode" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectItem value="blitz" className="text-base focus:bg-slate-700 focus:text-slate-100">Blitz (5|0)</SelectItem>
                    <SelectItem value="rapid" className="text-base focus:bg-slate-700 focus:text-slate-100">Rapid (10|0)</SelectItem>
                    <SelectItem value="unlimited" className="text-base focus:bg-slate-700 focus:text-slate-100">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <span className="px-3 py-1 text-sm font-medium rounded-md bg-slate-800 border border-slate-700 text-slate-300 tracking-wide">
                PvP Mode
              </span>
            )}

            {/* Back to home — full reload to reset state */}
            <button
              onClick={() => { window.location.href = "/" }}
              className="hidden md:inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              ← Home
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
