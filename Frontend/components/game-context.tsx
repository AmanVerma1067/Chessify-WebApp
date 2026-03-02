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
import { pvpSocket } from "@/lib/pvpSocket";

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
type AssignedColor = "w" | "b" | "spectator";

interface PendingPromotion {
  from: Square;
  to: Square;
  position: { x: number; y: number };
}

interface ChatMessage {
  text: string;
  color: string;
  timestamp: number;
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
  // PvP
  gameType: "ai" | "pvp";
  assignedColor: AssignedColor;
  spectatorCount: number;
  opponentConnected: boolean;
  pvpChatMessages: ChatMessage[];
  sendChat: (message: string) => void;
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
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true });

    const promotionMoves = moves.filter((move) => move.promotion);
    if (promotionMoves.length > 0) {
      const queenPromotions = promotionMoves.filter(
        (move) => move.promotion === "q"
      );
      if (queenPromotions.length > 0) {
        const move =
          queenPromotions[Math.floor(Math.random() * queenPromotions.length)];
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

function getInitialTime(mode: GameMode): number {
  switch (mode) {
    case "blitz":
      return 300;
    case "rapid":
      return 600;
    case "unlimited":
      return Infinity;
    default:
      return 600;
  }
}

interface GameProviderProps {
  children: ReactNode;
  mode?: "ai" | "pvp";
  gameId?: string;
}

export function GameProvider({ children, mode = "ai", gameId }: GameProviderProps) {
  const [pendingPromotion, setPendingPromotion] =
    useState<PendingPromotion | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [history, setHistory] = useState<Move[]>([]);
  const [currentMove, setCurrentMove] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [playerColor] = useState<PlayerColor>("w");
  const [gameMode, setGameModeState] = useState<GameMode>("rapid");
  const [lastMove, setLastMove] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
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

  // PvP state
  const [gameType] = useState<"ai" | "pvp">(mode);
  const [assignedColor, setAssignedColor] = useState<AssignedColor>("w");
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [pvpChatMessages, setPvpChatMessages] = useState<ChatMessage[]>([]);

  // PvP socket setup
  useEffect(() => {
    if (gameType !== "pvp" || !gameId) return;

    pvpSocket.connect();
    pvpSocket.emit("join-room", gameId);

    pvpSocket.on("role", (role: string) => {
      if (role === "white") setAssignedColor("w");
      else if (role === "black") setAssignedColor("b");
      else setAssignedColor("spectator");
    });

    pvpSocket.on("sync-board", (fenStr: string) => {
      const newGame = new Chess(fenStr);
      setGame(newGame);
      setFen(fenStr);
    });

    pvpSocket.on("opponent-joined", () => setOpponentConnected(true));

    pvpSocket.on(
      "opponent-move",
      ({ from, to, promotion }: { from: string; to: string; promotion?: string }) => {
        setGame((prev) => {
          const newGame = new Chess(prev.fen());
          const move = newGame.move({ from: from as Square, to: to as Square, promotion });
          if (move) {
            setFen(newGame.fen());
            setHistory((h) => [...h, move]);
            setCurrentMove((c) => c + 1);
            setLastMove({ from: from as Square, to: to as Square });
          }
          return newGame;
        });
      }
    );

    pvpSocket.on("move-confirmed", ({ fen: confirmedFen }: { fen: string }) => {
      const newGame = new Chess(confirmedFen);
      setGame(newGame);
      setFen(confirmedFen);
    });

    pvpSocket.on("chat-received", (msg: ChatMessage) => {
      setPvpChatMessages((prev) => [...prev, msg]);
    });

    pvpSocket.on("spectator-count", (count: number) =>
      setSpectatorCount(count)
    );

    pvpSocket.on("opponent-disconnected", () => {
      setOpponentConnected(false);
    });

    return () => {
      pvpSocket.off("role");
      pvpSocket.off("sync-board");
      pvpSocket.off("opponent-joined");
      pvpSocket.off("opponent-move");
      pvpSocket.off("move-confirmed");
      pvpSocket.off("chat-received");
      pvpSocket.off("spectator-count");
      pvpSocket.off("opponent-disconnected");
      pvpSocket.disconnect();
    };
  }, [gameType, gameId]);

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

  const fenRef = useRef(fen);
  useEffect(() => {
    fenRef.current = fen;
  }, [fen]);

  // Bot move trigger — only in AI mode
  useEffect(() => {
    if (gameType !== "ai") return;
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
  }, [fen, gameState, botThinking, game, gameType]);

  // Timer — only in AI mode
  useEffect(() => {
    if (gameType !== "ai") return;
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
  }, [isRunning, gameState, game, gameMode, gameType]);

  const isPawnPromotion = (from: Square, to: Square): boolean => {
    const piece = game.get(from);
    if (!piece || piece.type !== "p") return false;
    const toRank = parseInt(to[1]);
    return (
      (piece.color === "w" && toRank === 8) ||
      (piece.color === "b" && toRank === 1)
    );
  };

  const makeMove = (from: Square, to: Square, promotion?: string): boolean => {
    try {
      if (gameType === "pvp") {
        // In PvP, emit to server and wait for confirmation
        pvpSocket.emit("move", { roomId: gameId, from, to, promotion });
        return true;
      }

      // AI mode
      if (!promotion && isPawnPromotion(from, to)) {
        const boardElement = document.querySelector("[data-position]");
        const rect = boardElement?.getBoundingClientRect();
        const position = {
          x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
          y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
        };
        setPendingPromotion({ from, to, position });
        setShowPromotionDialog(true);
        return false;
      }

      const newGame = new Chess(game.fen());
      const move = newGame.move({ from, to, promotion: promotion || undefined });

      if (move) {
        setGame(newGame);
        setFen(newGame.fen());
        setHistory((prev) => [...prev, move]);
        setCurrentMove((prev) => prev + 1);
        setLastMove({ from, to });
        setSelectedPiece(null);

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
    if (gameType === "pvp") return;
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
    setHistory([]);
    setCurrentMove(0);
    setGameState("playing");
    setLastMove(null);
    setSelectedPiece(null);
    setBotMessage("New game started. Good luck!");
    setLastBotMoveNumber(0);
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

  const flipBoard = () => {
    if (gameType === "pvp") return;
    setBoardFlipped(!boardFlipped);
  };

  const changeGameMode = (mode: GameMode) => {
    setGameModeState(mode);
    const newTime = getInitialTime(mode);
    setTimeWhite(newTime);
    setTimeBlack(newTime);
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

  const sendChat = (message: string) => {
    if (gameType === "pvp") {
      pvpSocket.emit("chat", {
        roomId: gameId,
        msg: { text: message, color: assignedColor, timestamp: Date.now() },
      });
    }
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
    playerColor: gameType === "pvp" ? (assignedColor === "spectator" ? "w" : assignedColor) : playerColor,
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
    gameType,
    assignedColor,
    spectatorCount,
    opponentConnected,
    pvpChatMessages,
    sendChat,
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