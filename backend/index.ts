import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const users: Map<string, User> = new Map();
const rooms: Map<string, RoomInfo> = new Map();

interface User {
  id: string;
  username: string;
}

interface RoomInfo {
  roomNumber: string;
  playerInfo: User[];
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
  console.log("username: ", username);

  next();
});
app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

io.on("connection", (socket) => {
  const newUser: User = {
    id: socket.id,
    username: socket.handshake.auth.username,
  };
  users.set(socket.id, newUser);

  socket.emit("onConnect", newUser);
  socket.emit("message", "you have connected to the server!");

  socket.on("create", (socketId, extra) => {
    let roomNumber = Math.random().toString(36).substring(2, 7);
    while (rooms.has(roomNumber)) {
      roomNumber = Math.random().toString(36).substring(2, 7);
    }

    const currentUser = users.get(socketId);
    console.log("creating a room for", currentUser);
    console.log("room number: ", roomNumber);

    if (currentUser == undefined) {
      socket.emit("error", "unable to find the user");
    }
    const newRoom: RoomInfo = {
      roomNumber: roomNumber,
      playerInfo: [users.get(socketId) as User],
    };
    rooms.set(roomNumber, newRoom);
    socket.join(roomNumber);

    extra();
    socket.emit("newRoom", newRoom);
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected");
    users.delete(socket.id);
  });
});
