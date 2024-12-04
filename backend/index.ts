import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { User, RoomInfo, Message } from "./type";
import {
  endRoomConnection,
  roomEvent,
} from "./SocketEvents/SocketRoomLogic.ts";
import { GameEvent } from "./SocketEvents/SocketChessGameLogic.ts";
const app = express();
const server = createServer(app);

// stores all the users connected to the websocket(socket.io)
const users: Map<string, User> = new Map();

// stores all rooms in the socket
const rooms: Map<string, RoomInfo> = new Map();

const io = new Server(server, {
  cors: {
    origin: [
      "http://127.0.0.1:5173",
      "http://localhost:5173",
      "http://localhost:4173",
      "https://cs484finalproject.netlify.app",
    ],
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

// TODO: Try to move some of the logics insde io to http request instead
io.on("connection", (socket) => {
  // upon connection, create a new user and sent it to the client socket.
  const newUser: User = {
    id: socket.id,
    username: socket.handshake.auth.username,
    roomNumber: "",
  };
  users.set(socket.id, newUser);
  socket.emit("onConnect", newUser);
  socket.emit("message", "you have connected to the server!");

  // this is used for private chat between two sockets inside the room
  socket.on("chat message", (roomNumber: string, msg: Message) => {
    io.to(roomNumber).emit("chat message", msg);
  });

  roomEvent(io, socket, users, rooms);
  GameEvent(io, socket, users, rooms);
  socket.on("disconnect", () => {
    console.log("a user disconnected :", users.get(socket.id));
    // make sure to room request after disconnect
    // this is a function from SocketRoomLogic
    // endRoomConnection(io, socket, users, rooms);
    socket.disconnect();
    const user = users.get(socket.id) as User;
    const theRoom = rooms.get(user.roomNumber);

    // if the user disconnect when play with other player then notify that other player
    if (theRoom?.player.length == 2) {
      if (user.roomNumber !== "") {
        console.log("user disconnect, notify his opponent")
        theRoom.readyStatus = 0;
        theRoom.player = theRoom.player.filter((usr) => usr.id != user.id);
        const otherSocket = theRoom.player[0].id;
        console.log(otherSocket);
        io.to(otherSocket).emit("opponent leave");
      }
    }

    // delete user
    users.delete(socket.id);

    

  });
});
