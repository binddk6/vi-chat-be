import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = 3001;

interface RoomParticipant {
  id: string;
  socket: Socket;
}

let roomParticipants: RoomParticipant[] = [];

io.on("connection", (socket: Socket) => {
  console.log("New client connected", socket.id);

  socket.on("join_call", () => {
    const newParticipant = { id: socket.id, socket };
    roomParticipants.push(newParticipant);

    // Notify the new participant about existing participants
    roomParticipants.forEach((participant) => {
      if (participant.id !== socket.id) {
        socket.emit("user_joined", participant.id);
      }
    });

    // Notify existing participants about the new participant
    socket.broadcast.emit("user_joined", socket.id);

    console.log(
      `${socket.id} joined the call. Total participants: ${roomParticipants.length}`
    );
  });

  socket.on(
    "webrtc_offer",
    (data: { peerId: string; offer: RTCSessionDescriptionInit }) => {
      const { peerId, offer } = data;
      const targetParticipant = roomParticipants.find((p) => p.id === peerId);
      if (targetParticipant) {
        targetParticipant.socket.emit("webrtc_offer", {
          peerId: socket.id,
          offer,
        });
      }
    }
  );

  socket.on(
    "webrtc_answer",
    (data: { peerId: string; answer: RTCSessionDescriptionInit }) => {
      const { peerId, answer } = data;
      const targetParticipant = roomParticipants.find((p) => p.id === peerId);
      if (targetParticipant) {
        targetParticipant.socket.emit("webrtc_answer", {
          peerId: socket.id,
          answer,
        });
      }
    }
  );

  socket.on(
    "webrtc_ice_candidate",
    (data: { peerId: string; candidate: RTCIceCandidate }) => {
      const { peerId, candidate } = data;
      const targetParticipant = roomParticipants.find((p) => p.id === peerId);
      if (targetParticipant) {
        targetParticipant.socket.emit("webrtc_ice_candidate", {
          peerId: socket.id,
          candidate,
        });
      }
    }
  );

  socket.on("leave_call", () => {
    removeParticipant(socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
    removeParticipant(socket.id);
  });
});

function removeParticipant(id: string) {
  roomParticipants = roomParticipants.filter((p) => p.id !== id);
  io.emit("user_left", id);
  console.log(
    `${id} left the call. Total participants: ${roomParticipants.length}`
  );
}

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
