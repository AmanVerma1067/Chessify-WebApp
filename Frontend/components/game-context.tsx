"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Chess, type Move, type Square } from "chess.js"

type GameMode = "blitz" | "rapid" | "unlimited"
type GameState = "playing" | "check" | "checkmate" | "stalemate" | "draw" | "timeout"
type PlayerColor = "w" | "b"
type TimeoutColor = "w" | "b" | null

interface GameContextType {
  game: Chess
  fen: string
  history: Move[]
  currentMove: number
  gameState: GameState
  playerColor: PlayerColor
  gameMode: GameMode
  lastMove: { from: Square; to: Square } | null
  legalMoves: Record<string, Square[]>
  selectedPiece: Square | null
  botThinking: boolean
  botMessage: string | null
  timeWhite: number
  timeBlack: number
  isRunning: boolean
  timeoutColor: TimeoutColor
  makeMove: (from: Square, to: Square, promotion?: string) => boolean
  selectPiece: (square: Square | null) => void
  undoMove: () => void
  resetGame: () => void
  resignGame: () => void
  setGameMode: (mode: GameMode) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

// 🔁 Bot move API integration (Edit this URL to your backend)
const API_URL = "http://localhost:8000/get_bot_move"

async function getBotMove(fen: string): Promise<{ move: string; new_fen: string }> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen }),
    })

    if (!res.ok) throw new Error("Failed to fetch bot move from server")

    return await res.json()
  } catch (error) {
    console.error("Fallback: Bot API failed:", error)
    const game = new Chess(fen)
    const legal = game.moves({ verbose: true })
    if (legal.length === 0) throw new Error("No moves left")

    const move = legal[Math.floor(Math.random() * legal.length)]
    game.move(move)
    return {
      move: `${move.from}${move.to}${move.promotion ?? ""}`,
      new_fen: game.fen(),
    }
  }
}

function generateBotMessage(game: Chess, lastMove: Move | null, moveCount: number): string | null {
  const shouldGenerate = Math.random() < 0.4 || moveCount <= 2
  if (!shouldGenerate && moveCount > 2) return null

  if (moveCount < 8) {
    const opening = [
      "Opening up nicely!", "Controlling the center.", "Let's play classical chess!",
      "Knights before bishops!", "Time to castle soon!", "Solid foundation first."
    ]
    return opening[Math.floor(Math.random() * opening.length)]
  }

  if (lastMove?.captured) {
    const captures = [
      `Captured your ${getPieceName(lastMove.captured)}!`, "Material matters!", "Piece down!"
    ]
    return captures[Math.floor(Math.random() * captures.length)]
  }

  if (game.isCheck()) {
    const checks = [
      "Check! Defend wisely.", "Watch your king!", "King under fire!"
    ]
    return checks[Math.floor(Math.random() * checks.length)]
  }

  if (moveCount < 25) {
    const mid = [
      "Position getting spicy!", "Tactics incoming!", "Planning my strategy.",
      "Midgame muscle now!", "Focus mode on."
    ]
    return mid[Math.floor(Math.random() * mid.length)]
  }

  const end = [
    "Endgame is tricky!", "It's now or never!", "Precision matters now!"
  ]
  return end[Math.floor(Math.random() * end.length)]
}

function getPieceName(piece: string): string {
  return {
    p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king"
  }[piece] || "piece"
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState(new Chess())
  const [fen, setFen] = useState(game.fen())
  const [history, setHistory] = useState<Move[]>([])
  const [currentMove, setCurrentMove] = useState(0)
  const [gameState, setGameState] = useState<GameState>("playing")
  const [playerColor] = useState<PlayerColor>("w")
  const [gameMode, setGameMode] = useState<GameMode>("rapid")
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null)
  const [legalMoves, setLegalMoves] = useState<Record<string, Square[]>>({})
  const [selectedPiece, setSelectedPiece] = useState<Square | null>(null)
  const [botThinking, setBotThinking] = useState(false)
  const [botMessage, setBotMessage] = useState("Hello! I'm Chessify AI by Aman Verma. Ready?")
  const [timeWhite, setTimeWhite] = useState(600)
  const [timeBlack, setTimeBlack] = useState(600)
  const [isRunning, setIsRunning] = useState(true)
  const [timeoutColor, setTimeoutColor] = useState<TimeoutColor>(null)

useEffect(() => {
  const moves: Record<string, Square[]> = {}

  const board = game.board()

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file]
      if (piece) {
        // Convert file + rank to square (e.g., 4,6 => "e2")
        const fileChar = String.fromCharCode("a".charCodeAt(0) + file)
        const rankNum = 8 - rank
        const square = `${fileChar}${rankNum}` as Square

        const legalMovesForPiece = game.moves({ square, verbose: true })
        if (legalMovesForPiece.length > 0) {
          moves[square] = legalMovesForPiece.map((move) => move.to as Square)
        }
      }
    }
  }

  setLegalMoves(moves)
}, [game, fen])


  useEffect(() => {
    if (game.isCheckmate()) setGameState("checkmate")
    else if (game.isStalemate()) setGameState("stalemate")
    else if (game.isDraw()) setGameState("draw")
    else if (game.isCheck()) setGameState("check")
    else setGameState("playing")
  }, [fen])

  useEffect(() => {
    if (game.turn() !== playerColor && gameState === "playing" && !botThinking) {
      setBotThinking(true)
      const thinkTime = Math.random() * 2000 + 1000
      setTimeout(async () => {
        try {
          const { move } = await getBotMove(game.fen())
          const from = move.slice(0, 2) as Square
          const to = move.slice(2, 4) as Square
          const promotion = move.length > 4 ? move[4] : undefined

          const result = game.move({ from, to, promotion })
          if (result) {
            setFen(game.fen())
            setHistory(game.history({ verbose: true }))
            setCurrentMove(game.history().length)
            setLastMove({ from, to })
            const msg = generateBotMessage(game, result, game.history().length)
            if (msg) setBotMessage(msg)
          }
        } catch (err) {
          console.error("Bot failed to move:", err)
        } finally {
          setBotThinking(false)
        }
      }, thinkTime)
    }
  }, [fen, gameState, botThinking])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRunning || gameMode === "unlimited" || gameState !== "playing") return
      if (game.turn() === "w") {
        setTimeWhite((t) => {
          if (t <= 1) {
            setGameState("timeout")
            setTimeoutColor("w")
            setIsRunning(false)
            return 0
          }
          return t - 1
        })
      } else {
        setTimeBlack((t) => {
          if (t <= 1) {
            setGameState("timeout")
            setTimeoutColor("b")
            setIsRunning(false)
            return 0
          }
          return t - 1
        })
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, gameState, gameMode])

  const makeMove = (from: Square, to: Square, promotion?: string): boolean => {
    const move = game.move({ from, to, promotion })
    if (!move) return false
    setFen(game.fen())
    setHistory(game.history({ verbose: true }))
    setCurrentMove(game.history().length)
    setLastMove({ from, to })
    setSelectedPiece(null)
    return true
  }

  const undoMove = () => {
    if (game.history().length === 0) return
    game.undo()
    if (game.turn() !== playerColor) game.undo()
    setFen(game.fen())
    setHistory(game.history({ verbose: true }))
    setCurrentMove(game.history().length)
    setLastMove(null)
  }

  const resetGame = () => {
    const g = new Chess()
    setGame(g)
    setFen(g.fen())
    setHistory([])
    setCurrentMove(0)
    setGameState("playing")
    setLastMove(null)
    setBotMessage("Fresh game, fresh opportunities!")
    setSelectedPiece(null)
    setTimeoutColor(null)
    setTimeWhite(gameMode === "blitz" ? 300 : gameMode === "rapid" ? 600 : Number.POSITIVE_INFINITY)
    setTimeBlack(gameMode === "blitz" ? 300 : gameMode === "rapid" ? 600 : Number.POSITIVE_INFINITY)
    setIsRunning(true)
  }

  const resignGame = () => {
    setGameState("checkmate")
    setIsRunning(false)
    setBotMessage("You resigned. Good game!")
  }

  const changeGameMode = (mode: GameMode) => {
    setGameMode(mode)
    setTimeout(() => resetGame(), 0)
  }

  return (
    <GameContext.Provider
      value={{
        game, fen, history, currentMove, gameState, playerColor,
        gameMode, lastMove, legalMoves, selectedPiece, botThinking,
        botMessage, timeWhite, timeBlack, isRunning, timeoutColor,
        makeMove, selectPiece: setSelectedPiece, undoMove,
        resetGame, resignGame, setGameMode: changeGameMode,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
