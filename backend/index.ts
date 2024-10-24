import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const users: Map<string, User> = new Map();
interface User {
  id: string;
  username: string;
}
const io = new Server(server, {
  cors: {
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  },
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username || username === "error") {
    return next(new Error("invalid username"));
  }

  console.log("a user connected");
  console.log("username: ", socket.handshake.auth.username);
  socket.username = username;
  users.set(socket.id, {
    id: socket.id,
    username: socket.username,
  });

  next();
});
app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

io.on("connection", (socket) => {
  io.emit("message", "you have connected to the server!");

  io.emit("users", Array.from(users.values()));

  socket.on("disconnect", () => {
    console.log("a user disconnected");
    users.delete(socket.id);
    io.emit("users", Array.from(users.values()));
  });
});
