import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://vi-chat-git-development-binddk6s-projects.vercel.app/",
      "https://vi-chat-inky.vercel.app/",
      "https://vi-chat-binddk6s-projects.vercel.app/",
    ],
    methods: ["GET", "POST"],
  },
});

const PORT = 3001;

let roomParticipants: string[] = [];

io.on("connection", (socket: Socket) => {
  console.log("New client connected");

  socket.on("join", () => {
    roomParticipants.push(socket.id);
    if (roomParticipants.length === 2) {
      io.emit("start_call");
    }
  });

  socket.on("webrtc_offer", (offer: RTCSessionDescriptionInit) => {
    socket.broadcast.emit("webrtc_offer", offer);
  });

  socket.on("webrtc_answer", (answer: RTCSessionDescriptionInit) => {
    socket.broadcast.emit("webrtc_answer", answer);
  });

  socket.on("webrtc_ice_candidate", (candidate: RTCIceCandidate) => {
    socket.broadcast.emit("webrtc_ice_candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    roomParticipants = roomParticipants.filter((id) => id !== socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
