import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5173",
  },
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  io.emit("message", "you have connected to the server!");
  socket.on("disconnect", (socket) => {
    console.log("a user disconnected");
  });
});
