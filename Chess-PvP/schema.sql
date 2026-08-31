-- Grain: One record per ply (individual half-move made by a player) within a specific game.
-- ====================================================================================
-- Chessify PvP - Game Event Persistence Schema & Analytical Queries
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- ARCHITECTURAL RATIONALE: Event Stream (moves) vs. Mutable State Entity (games)
-- ------------------------------------------------------------------------------------
-- 1. 'moves' is an APPEND-ONLY FACT TABLE (Event Stream):
--    - Nature: Immutable, chronological ledger of discrete state transitions (plies).
--    - Write Pattern: High-frequency, insert-only. Once recorded, moves are never updated.
--    - Indexing Strategy:
--      * Composite Primary Key on (game_id, ply_number) provides natural physical/B-tree
--        clustering for sequential write throughput, prevents duplicate plies, and enables
--        lightning-fast range scans for game replay (WHERE game_id = $1 ORDER BY ply_number).
--      * Minimal auxiliary indexes to avoid write amplification during live gameplay.
--
-- 2. 'games' is a MUTABLE DIMENSION / STATE ROW (Entity State):
--    - Nature: Accumulates lifecycle state transitions (in_progress -> completed/resigned).
--    - Write Pattern: Low-frequency point updates at game termination (result, termination_reason).
--    - Indexing Strategy:
--      * Primary key lookup on game_id.
--      * B-tree index on (created_at, time_control) for temporal slicing and OLAP partitioning.
--      * B-tree index on (result) for rapid filtering in win-rate & leaderboard aggregations.
-- ------------------------------------------------------------------------------------

-- Table: games (Aggregated Game Entity)
CREATE TABLE IF NOT EXISTS games (
    game_id VARCHAR(64) PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    time_control VARCHAR(32) NOT NULL DEFAULT 'rapid_10m', -- 'blitz_5m', 'rapid_10m', 'unlimited'
    result VARCHAR(16) DEFAULT 'in_progress',              -- '1-0', '0-1', '1/2-1/2', 'in_progress', 'aborted'
    termination_reason VARCHAR(32),                        -- 'checkmate', 'stalemate', 'resignation', 'timeout', 'draw_agreed', 'abandoned'
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_created_timecontrol ON games (created_at DESC, time_control);
CREATE INDEX IF NOT EXISTS idx_games_result ON games (result);

-- Table: moves (Granular Event Stream)
CREATE TABLE IF NOT EXISTS moves (
    game_id VARCHAR(64) NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    ply_number INT NOT NULL,                               -- 1-based sequential ply counter (1: White, 2: Black, 3: White...)
    san VARCHAR(16) NOT NULL,                              -- Standard Algebraic Notation (e.g. 'e4', 'Nf3', 'O-O', 'Qxf7#')
    fen_after TEXT NOT NULL,                               -- Snapshot FEN string after move execution
    moved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    time_remaining_ms INT,                                 -- Clock snapshot in milliseconds
    PRIMARY KEY (game_id, ply_number)
);


-- ====================================================================================
-- ANALYTICAL QUERIES
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- Query 1: Average Game Length by Time Control
-- Calculates average plies (half-moves) and full moves across completed games.
-- ------------------------------------------------------------------------------------
SELECT 
    g.time_control,
    COUNT(DISTINCT g.game_id) AS completed_games,
    ROUND(AVG(m.max_ply), 2) AS avg_plies,
    ROUND(AVG(m.max_ply) / 2.0, 2) AS avg_full_moves
FROM games g
JOIN (
    SELECT game_id, MAX(ply_number) AS max_ply
    FROM moves
    GROUP BY game_id
) m ON g.game_id = m.game_id
WHERE g.result IN ('1-0', '0-1', '1/2-1/2')
GROUP BY g.time_control
ORDER BY completed_games DESC;


-- ------------------------------------------------------------------------------------
-- Query 2: Most Common Opening by First Three Plies
-- Reconstructs opening branches (e.g. 'e4 e5 Nf3' vs 'd4 Nf6 c4') using STRING_AGG.
-- ------------------------------------------------------------------------------------
WITH opening_branches AS (
    SELECT 
        game_id,
        STRING_AGG(san, ' ' ORDER BY ply_number) AS opening_sequence
    FROM moves
    WHERE ply_number <= 3
    GROUP BY game_id
    HAVING COUNT(ply_number) = 3
)
SELECT 
    opening_sequence,
    COUNT(*) AS game_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS share_pct
FROM opening_branches
GROUP BY opening_sequence
ORDER BY game_count DESC
LIMIT 10;


-- ------------------------------------------------------------------------------------
-- Query 3: Win Rate by Colour
-- Measures decisive outcome distribution (White wins vs Black wins vs Draws).
-- ------------------------------------------------------------------------------------
SELECT 
    COUNT(*) AS total_decisive_games,
    ROUND(100.0 * COUNT(*) FILTER (WHERE result = '1-0') / COUNT(*), 2) AS white_win_pct,
    ROUND(100.0 * COUNT(*) FILTER (WHERE result = '0-1') / COUNT(*), 2) AS black_win_pct,
    ROUND(100.0 * COUNT(*) FILTER (WHERE result = '1/2-1/2') / COUNT(*), 2) AS draw_pct
FROM games
WHERE result IN ('1-0', '0-1', '1/2-1/2');


-- ------------------------------------------------------------------------------------
-- Query 4: Per-Game Time-Pressure Analysis using LAG() on time_remaining_ms
-- Compares a player's clock to their previous move (lag 2 plies) to determine think
-- time per move, and categorizes moves executed under acute time trouble (< 15s).
-- ------------------------------------------------------------------------------------
WITH move_intervals AS (
    SELECT 
        game_id,
        ply_number,
        san,
        time_remaining_ms,
        -- LAG by 2 plies retrieves the same player's clock from their previous turn
        LAG(time_remaining_ms, 2) OVER (
            PARTITION BY game_id ORDER BY ply_number
        ) AS prev_clock_ms
    FROM moves
    WHERE time_remaining_ms IS NOT NULL
)
SELECT 
    game_id,
    ply_number,
    san,
    ROUND(time_remaining_ms / 1000.0, 2) AS clock_remaining_sec,
    ROUND((prev_clock_ms - time_remaining_ms) / 1000.0, 2) AS think_time_sec,
    CASE 
        WHEN time_remaining_ms < 15000 THEN 'ACUTE_TIME_PRESSURE (<15s)'
        WHEN time_remaining_ms < 60000 THEN 'MODERATE_TIME_PRESSURE (<60s)'
        ELSE 'COMFORTABLE'
    END AS time_pressure_status
FROM move_intervals
ORDER BY game_id, ply_number;
