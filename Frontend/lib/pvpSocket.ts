import { io } from 'socket.io-client'

export const pvpSocket = io('https://chess-pvp-qhw7.onrender.com', {
  autoConnect: false  // connect only when entering PvP mode
})