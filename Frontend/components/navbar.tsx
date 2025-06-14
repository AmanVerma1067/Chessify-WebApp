"use client"
import { useGame } from "@/components/game-context"
import { ChessIcon } from "@/components/chess-icon"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatTime } from "@/lib/utils"

export default function Navbar() {
  const { gameMode, setGameMode, timeWhite, timeBlack } = useGame()

  return (
    <nav className="w-full bg-gray-800/80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <ChessIcon className="h-8 w-8 text-cyan-400" />
            <span className="ml-3 text-2xl font-bold text-white tracking-tight">Chessify AI</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4 text-base text-gray-200 font-medium">
              <span>White: {formatTime(timeWhite)}</span>
              <span className="text-gray-400">|</span>
              <span>Black: {formatTime(timeBlack)}</span>
            </div>

            <div className="relative">
              <Select value={gameMode} onValueChange={(value) => setGameMode(value as "blitz" | "rapid" | "unlimited")}>
                <SelectTrigger className="w-[140px] text-base font-medium">
                  <SelectValue placeholder="Game Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blitz" className="text-base">
                    Blitz (5|0)
                  </SelectItem>
                  <SelectItem value="rapid" className="text-base">
                    Rapid (10|0)
                  </SelectItem>
                  <SelectItem value="unlimited" className="text-base">
                    Unlimited
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
