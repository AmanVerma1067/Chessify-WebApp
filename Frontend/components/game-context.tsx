"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { Chess, SQUARES, type Move, type Square } from "chess.js";

type GameMode = "blitz" | "rapid" | "unlimited";
type GameState =
  | "playing"
  | "check"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "timeout";
type PlayerColor = "w" | "b";
type TimeoutColor = "w" | "b" | null;

interface PendingPromotion {
  from: Square;
  to: Square;
  position: { x: number; y: number };
}

interface GameContextType {
  game: Chess;
  fen: string;
  history: Move[];
  currentMove: number;
  gameState: GameState;
  playerColor: PlayerColor;
  gameMode: GameMode;
  lastMove: { from: Square; to: Square } | null;
  legalMoves: Record<string, Square[]>;
  selectedPiece: Square | null;
  botThinking: boolean;
  botMessage: string | null;
  timeWhite: number;
  timeBlack: number;
  isRunning: boolean;
  timeoutColor: TimeoutColor;
  boardFlipped: boolean;
  pendingPromotion: PendingPromotion | null;
  showPromotionDialog: boolean;
  handlePromotion: (piece: "q" | "r" | "b" | "n") => void;
  cancelPromotion: () => void;
  makeMove: (from: Square, to: Square, promotion?: string) => boolean;
  selectPiece: (square: Square | null) => void;
  undoMove: () => void;
  resetGame: () => void;
  resignGame: () => void;
  setGameMode: (mode: GameMode) => void;
  flipBoard: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

// ========== BOT SETTINGS ==========

const BOT_MESSAGES = [
  "Hmm, interesting move.",
  "Let's see where this goes.",
  "Thinking ahead…",
  "I'm gaining control.",
  "This position is complex.",
  "Careful! 😏",
  "Interesting move! Let's see what you do next.",
  "I'm thinking... and here's my reply.",
  "That was a clever move!",
  "Trying to keep up with your strategy.",
  "Let's spice things up.",
  "Your turn! Make it count.",
  "I see what you're planning.",
  "Nice! But can you keep it up?",
  "That was unexpected!",
  "Let's keep the game going.",
  "I'm enjoying this match.",
  "Good move! Now it's my turn.",
];

function getRandomBotMessage(): string {
  return BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)];
}
const DEPTH = 3;

async function getBotMove(fen: string) {
  try {
const res = await fetch("/api/chess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen, depth: DEPTH, maxThinkingTime: 100 }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Error ${res.status}: ${errorText}`);
    }

    return await res.json();
  } catch (e) {
    console.error("API call failed:", e);
    // Fallback logic with promotion handling
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true });
    
    // Prefer queen promotion for bot
    const promotionMoves = moves.filter(move => move.promotion);
    if (promotionMoves.length > 0) {
      const queenPromotions = promotionMoves.filter(move => move.promotion === 'q');
      if (queenPromotions.length > 0) {
        const move = queenPromotions[Math.floor(Math.random() * queenPromotions.length)];
        game.move(move);
        return {
          move: `${move.from}${move.to}${move.promotion}`,
          new_fen: game.fen(),
          eval: 0,
          san: move.san,
        };
      }
    }
    
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    game.move(randomMove);

    return {
      move: `${randomMove.from}${randomMove.to}${randomMove.promotion || ""}`,
      new_fen: game.fen(),
      eval: 0,
      san: randomMove.san,
    };
  }
}

// Helper function to get initial time based on game mode
function getInitialTime(mode: GameMode): number {
  switch (mode) {
    case "blitz":
      return 300; // 5 minutes
    case "rapid":
      return 600; // 10 minutes
    case "unlimited":
      return Infinity;
    default:
      return 600; // Default to rapid
  }
}

// ========== GAME PROVIDER ==========
export function GameProvider({ children }: { children: ReactNode }) {
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [history, setHistory] = useState<Move[]>([]);
  const [currentMove, setCurrentMove] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [playerColor] = useState<PlayerColor>("w");
  const [gameMode, setGameModeState] = useState<GameMode>("rapid");
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(
    null
  );

  const [legalMoves, setLegalMoves] = useState<Record<string, Square[]>>({});
  const [selectedPiece, setSelectedPiece] = useState<Square | null>(null);
  const [botThinking, setBotThinking] = useState(false);
  const [botMessage, setBotMessage] = useState<string | null>(
    "Hello! I'm Chessify AI v2 by Aman Verma. Ready for an enhanced chess experience?"
  );
  const [timeWhite, setTimeWhite] = useState(() => getInitialTime("rapid"));
  const [timeBlack, setTimeBlack] = useState(() => getInitialTime("rapid"));
  const [isRunning, setIsRunning] = useState(true);
  const [timeoutColor, setTimeoutColor] = useState<TimeoutColor>(null);
  const [boardFlipped, setBoardFlipped] = useState(false);

  const [lastBotMoveNumber, setLastBotMoveNumber] = useState(0);

  // Legal moves tracking
  useEffect(() => {
    const moves: Record<string, Square[]> = {};
    SQUARES.forEach((square) => {
      const legal = game.moves({ square, verbose: true });
      if (legal.length > 0) {
        moves[square] = legal.map((m) => m.to as Square);
      }
    });
    setLegalMoves(moves);
  }, [fen, game]);

  // Game state check
  useEffect(() => {
    if (game.isCheckmate()) {
      setGameState("checkmate");
    } else if (game.isStalemate()) {
      setGameState("stalemate");
    } else if (game.isDraw()) {
      setGameState("draw");
    } else if (game.isCheck()) {
      setGameState("check");
    } else {
      setGameState("playing");
    }
  }, [fen, game]);

  // Bot move trigger
  // Add useRef for fresh state access
  const fenRef = useRef(fen);
  useEffect(() => {
    fenRef.current = fen;
  }, [fen]);

  // Fixed bot move useEffect
  // Update bot move effect
  useEffect(() => {
    if (game.turn() === "b" && gameState === "playing" && !botThinking) {
      setBotThinking(true);
      const thinkTime = Math.floor(Math.random() * 2000) + 1000;
      const currentFen = game.fen();

      setTimeout(async () => {
        try {
          const { move: moveStr } = await getBotMove(currentFen);
          const from = moveStr.slice(0, 2) as Square;
          const to = moveStr.slice(2, 4) as Square;
          const promotion = moveStr.length > 4 ? moveStr[4] : undefined;

          const newGame = new Chess(currentFen);
          const move = newGame.move({ from, to, promotion });

          setGame(newGame);
          setFen(newGame.fen());
          // Add bot move to history
          setHistory((prev) => [...prev, move]);
          setCurrentMove((prev) => prev + 1);
          setLastMove({ from, to });
          setBotMessage(getRandomBotMessage());
        } catch (e) {
          console.error("Bot move error:", e);
        } finally {
          setBotThinking(false);
        }
      }, thinkTime);
    }
  }, [fen, gameState, botThinking, game]);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && gameState === "playing" && gameMode !== "unlimited") {
      timer = setInterval(() => {
        if (game.turn() === "w") {
          setTimeWhite((prev) =>
            prev <= 1
              ? (setGameState("timeout"),
                setTimeoutColor("w"),
                setIsRunning(false),
                0)
              : prev - 1
          );
        } else {
          setTimeBlack((prev) =>
            prev <= 1
              ? (setGameState("timeout"),
                setTimeoutColor("b"),
                setIsRunning(false),
                0)
              : prev - 1
          );
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, gameState, game, gameMode]);

  // Check if move is a pawn promotion
  const isPawnPromotion = (from: Square, to: Square): boolean => {
    const piece = game.get(from);
    if (!piece || piece.type !== 'p') return false;
    
    const toRank = parseInt(to[1]);
    return (piece.color === 'w' && toRank === 8) || (piece.color === 'b' && toRank === 1);
  };

  // Update makeMove function
  const makeMove = (from: Square, to: Square, promotion?: string): boolean => {
    try {
      // Check if this is a pawn promotion move
      if (!promotion && isPawnPromotion(from, to)) {
        // Get screen position for dialog
        const boardElement = document.querySelector('[data-position]');
        const rect = boardElement?.getBoundingClientRect();
        const position = {
          x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
          y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2
        };

        setPendingPromotion({ from, to, position });
        setShowPromotionDialog(true);
        return false; // Don't make the move yet
      }

      const newGame = new Chess(game.fen());
      const move = newGame.move({
        from,
        to,
        promotion: promotion || undefined,
      });

      if (move) {
        setGame(newGame);
        setFen(newGame.fen());
        setHistory((prev) => [...prev, move]);
        setCurrentMove((prev) => prev + 1);
        setLastMove({ from, to });
        setSelectedPiece(null);
        
        // Clear promotion state if it was a promotion move
        if (pendingPromotion) {
          setPendingPromotion(null);
          setShowPromotionDialog(false);
        }
        
        return true;
      }
    } catch (e) {
      console.error("Invalid move", e);
    }
    return false;
  };

  const handlePromotion = (piece: "q" | "r" | "b" | "n") => {
    if (pendingPromotion) {
      makeMove(pendingPromotion.from, pendingPromotion.to, piece);
    }
  };

  const cancelPromotion = () => {
    setPendingPromotion(null);
    setShowPromotionDialog(false);
    setSelectedPiece(null);
  };

  const selectPiece = (square: Square | null) => setSelectedPiece(square);

  const undoMove = () => {
    if (game.history().length > 0) {
      game.undo();
      game.undo();
      setFen(game.fen());
      setHistory(game.history({ verbose: true }));
      setCurrentMove(game.history().length);
      setLastMove(null);
      setBotMessage("Move undone. Your turn again!");
    }
  };

  const resetGame = () => {
    const freshGame = new Chess();
    setGame(freshGame);
    setFen(freshGame.fen());
    setHistory([]); // Reset history to empty array
    setCurrentMove(0);
    setGameState("playing");
    setLastMove(null);
    setSelectedPiece(null);
    setBotMessage("New game started. Good luck!");
    setLastBotMoveNumber(0);

    // Set timers based on current game mode
    const newTime = getInitialTime(gameMode);
    setTimeWhite(newTime);
    setTimeBlack(newTime);

    setIsRunning(true);
  };

  const resignGame = () => {
    setGameState("checkmate");
    setIsRunning(false);
    setBotMessage("You resigned. Want to try again?");
  };

  const flipBoard = () => setBoardFlipped(!boardFlipped);

  // Fixed game mode change function
  const changeGameMode = (mode: GameMode) => {
    console.log(`Changing game mode from ${gameMode} to ${mode}`); // Debug log
    setGameModeState(mode);
    
    // Update timers immediately based on new mode
    const newTime = getInitialTime(mode);
    setTimeWhite(newTime);
    setTimeBlack(newTime);
    
    // Reset the game with new mode
    const freshGame = new Chess();
    setGame(freshGame);
    setFen(freshGame.fen());
    setHistory([]);
    setCurrentMove(0);
    setGameState("playing");
    setLastMove(null);
    setSelectedPiece(null);
    setBotMessage(`New ${mode} game started. Good luck!`);
    setLastBotMoveNumber(0);
    setIsRunning(true);
  };

  const value: GameContextType = {
    pendingPromotion,
    showPromotionDialog,
    handlePromotion,
    cancelPromotion,
    game,
    fen,
    history,
    currentMove,
    gameState,
    playerColor,
    gameMode,
    lastMove,
    legalMoves,
    selectedPiece,
    botThinking,
    botMessage,
    timeWhite,
    timeBlack,
    isRunning,
    timeoutColor,
    boardFlipped,
    makeMove,
    selectPiece,
    undoMove,
    resetGame,
    resignGame,
    setGameMode: changeGameMode,
    flipBoard,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}