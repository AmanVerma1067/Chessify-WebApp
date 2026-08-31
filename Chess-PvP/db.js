const isPersistenceEnabled = process.env.PERSIST_GAMES === "true";
let pool = null;

if (isPersistenceEnabled && process.env.DATABASE_URL) {
    try {
        const { Pool } = require("pg");
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
        });
        pool.on("error", (err) => console.error("[DB] Unexpected idle client error:", err.message));
        console.log("[DB] Game event persistence enabled.");
    } catch (err) {
        console.warn("[DB] Failed to initialize PostgreSQL pool:", err.message);
    }
} else if (isPersistenceEnabled) {
    console.warn("[DB] PERSIST_GAMES=true but DATABASE_URL is not set. Persistence inactive.");
}

async function recordGameStart(gameId, timeControl = "rapid_10m") {
    if (!pool) return;
    try {
        await pool.query(
            `INSERT INTO games (game_id, time_control, result) VALUES ($1, $2, 'in_progress')
             ON CONFLICT (game_id) DO NOTHING`,
            [gameId, timeControl]
        );
    } catch (err) {
        console.error("[DB] recordGameStart error:", err.message);
    }
}

async function recordMove(gameId, plyNumber, san, fenAfter, timeRemainingMs = null) {
    if (!pool) return;
    try {
        await pool.query(
            `INSERT INTO moves (game_id, ply_number, san, fen_after, time_remaining_ms)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (game_id, ply_number) DO NOTHING`,
            [gameId, plyNumber, san, fenAfter, timeRemainingMs]
        );
    } catch (err) {
        console.error("[DB] recordMove error:", err.message);
    }
}

async function recordGameEnd(gameId, result, terminationReason) {
    if (!pool) return;
    try {
        await pool.query(
            `UPDATE games SET result = $1, termination_reason = $2, updated_at = NOW() WHERE game_id = $3`,
            [result, terminationReason, gameId]
        );
    } catch (err) {
        console.error("[DB] recordGameEnd error:", err.message);
    }
}

module.exports = { recordGameStart, recordMove, recordGameEnd };
