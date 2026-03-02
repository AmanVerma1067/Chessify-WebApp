const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { Chess } = require("chess.js");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});

/*
Room Structure
rooms = {
  roomId: {
    players: {
      white: null,
      black: null
    },
    spectators: [],
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  }
}
*/
let rooms = {};
const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {
        socket.join(roomId);

        // Initialize room if it doesn't exist
        if (!rooms[roomId]) {
            rooms[roomId] = {
                players: { white: null, black: null },
                spectators: [],
                fen: INITIAL_FEN
            };
        }

        const room = rooms[roomId];

        // Remove socket from everywhere to handle quick reconnects cleanly
        if (room.players.white === socket.id) room.players.white = null;
        if (room.players.black === socket.id) room.players.black = null;
        room.spectators = room.spectators.filter(id => id !== socket.id);

        // Assign Role Strategy:
        // 1. If white is empty, assign White
        // 2. If black is empty, assign Black
        // 3. Else, assign Spectator
        let role = "spectator";

        if (!room.players.white) {
            room.players.white = socket.id;
            role = "white";
        } else if (!room.players.black) {
            room.players.black = socket.id;
            role = "black";
        } else {
            room.spectators.push(socket.id);
        }

        console.log(`Socket ${socket.id} joined room ${roomId} as ${role}`);

        // Send role to the user
        socket.emit("role", role);

        // Send latest board state to the newly joined user
        socket.emit("sync-board", room.fen);

        // Notify others of spectator count
        io.to(roomId).emit("spectator-count", room.spectators.length);

        // Check if both players are present
        if (room.players.white && room.players.black) {
            io.to(roomId).emit("opponent-joined");
        }
    });

    socket.on("move", ({ roomId, from, to, promotion }) => {
        const room = rooms[roomId];
        if (!room) return;

        // Detect sender's color
        let senderColor = null;
        if (room.players.white === socket.id) senderColor = 'w';
        else if (room.players.black === socket.id) senderColor = 'b';

        if (!senderColor) return; // Spectators cannot move

        const game = new Chess(room.fen);
        const expectedTurn = game.turn(); // 'w' or 'b'

        // Prevent moving out of turn
        if (expectedTurn !== senderColor) return;

        try {
            const result = game.move({ from, to, promotion });
            if (!result) return; // Invalid move

            room.fen = game.fen();

            // Broadcast move to opponent and spectators
            socket.to(roomId).emit("opponent-move", { from, to, promotion });

            // Confirm move back to sender
            socket.emit("move-confirmed", { fen: room.fen });

        } catch (e) {
            console.log("Invalid move attempted:", e);
        }
    });

    socket.on("chat", ({ roomId, msg }) => {
        // Note: ensure this matches the frontend listener
        // User's frontend was listening to "chat", so we use "chat"
        io.to(roomId).emit("chat", msg);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        for (let roomId in rooms) {
            const room = rooms[roomId];
            let wasPlayer = false;

            if (room.players.white === socket.id) {
                room.players.white = null;
                wasPlayer = true;
            }
            if (room.players.black === socket.id) {
                room.players.black = null;
                wasPlayer = true;
            }

            room.spectators = room.spectators.filter(id => id !== socket.id);

            if (wasPlayer) {
                // Notify the remaining player/spectators that a player left
                io.to(roomId).emit("opponent-disconnected");
            }

            // Update spectator count for remaining users
            io.to(roomId).emit("spectator-count", room.spectators.length);

            // Clean up empty rooms
            if (!room.players.white && !room.players.black && room.spectators.length === 0) {
                console.log("Deleting empty room:", roomId);
                delete rooms[roomId];
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Realtime server running on port ${PORT}`);
});
