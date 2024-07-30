import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", () => {
    // Your join logic
  });

  socket.on("webrtc_offer", (offer) => {
    // Your offer logic
    socket.broadcast.emit("webrtc_offer", offer);
  });

  socket.on("webrtc_answer", (answer) => {
    // Your answer logic
    socket.broadcast.emit("webrtc_answer", answer);
  });

  socket.on("webrtc_ice_candidate", (candidate) => {
    // Your ICE candidate logic
    socket.broadcast.emit("webrtc_ice_candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

export default function SocketHandler(req, res) {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    res.socket.server.io = io;
  }
  res.end();
}
