"use client";

import { useGame } from "@/components/game-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function MoveHistory() {
  const { history, currentMove } = useGame();

  // Group moves by pairs (white and black)
  const groupedMoves = [];
  for (let i = 0; i < history.length; i += 2) {
    groupedMoves.push({
      number: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
    });
  }

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-3 text-gray-100">Move History</h3>

      <ScrollArea className="flex-grow border rounded-md p-3 bg-gray-900/50">
        <div className="space-y-2">
          {groupedMoves.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-base">
              No moves yet
            </p>
          ) : (
            // In MoveHistory component
            groupedMoves.map((move, index) => (
              <div key={index} className="flex text-base">
                <span className="w-10 text-gray-400 font-medium">
                  {move.number}.
                </span>
                <span
                  className={cn(
                    "flex-1 font-mono text-gray-200",
                    history.indexOf(move.white) === currentMove - 1 &&
                      "bg-cyan-900 rounded px-2 py-1"
                  )}
                >
                  {move.white?.san}
                </span>
                <span
                  className={cn(
                    "flex-1 font-mono text-gray-200",
                    move.black &&
                      history.indexOf(move.black) === currentMove - 1 &&
                      "bg-cyan-900 rounded px-2 py-1"
                  )}
                >
                  {move.black?.san}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
