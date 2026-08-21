import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Patient/Doctor joins a facility room
  socket.on("join-facility", (facilityId) => {
    socket.join(facilityId);
    console.log(`User ${socket.id} joined facility: ${facilityId}`);
  });

  // Doctor calls a token
  socket.on("call-token", (data) => {
    console.log("📢 Token called:", data);
    io.to(data.facilityId).emit("token-called", data);
  });

  // Doctor availability changes
  socket.on("doctor-status", (data) => {
    console.log("👨‍⚕️ Doctor status:", data);
    io.to(data.facilityId).emit("doctor-status-updated", data);
  });

  // Emergency alert
  socket.on("emergency-alert", (data) => {
    console.log("🚨 Emergency alert:", data);
    io.to(data.facilityId).emit("emergency-alert", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("MediPulse Socket.IO Server is running 🚀");
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`🚀 MediPulse server running on port ${PORT}`);
});