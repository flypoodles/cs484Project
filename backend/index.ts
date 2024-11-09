import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { User, RoomInfo, Message } from "./type";
const app = express();
const server = createServer(app);

// stores all the users connected to the websocket(socket.io)
const users: Map<string, User> = new Map();

// stores all rooms in the socket
const rooms: Map<string, RoomInfo> = new Map();

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
  socket.on("createRoom", () => {
    // picking a unique room number
    let roomNumber = Math.random().toString(36).substring(2, 7);
    while (rooms.has(roomNumber)) {
      roomNumber = Math.random().toString(36).substring(2, 7);
    }

    const currentUser = users.get(socket.id);
    console.log("creating a room for", currentUser);
    console.log("room number: ", roomNumber);

    if (currentUser == undefined) {
      socket.emit("error", "unable to find the user");
      return;
    }
    currentUser.roomNumber = roomNumber;
    users.set(socket.id, currentUser);

    const newRoom: RoomInfo = {
      roomNumber: roomNumber,
      player: [currentUser],
      turn: 0,
    };
    rooms.set(roomNumber, newRoom);
    socket.join(roomNumber);

    // send the newRoom back to the client socket
    socket.emit("newRoom", null, newRoom.player[0], roomNumber, 0);
  });

  socket.on("Join Room Request", (roomNumber: string) => {
    if (!rooms.has(roomNumber)) {
      socket.emit("Join Error", "room not found");
      return;
    }

    const theRoom: RoomInfo = rooms.get(roomNumber) as RoomInfo;
    if (theRoom.player.length > 1) {
      socket.emit("Join Error", "room is full");
      return;
    }

    const currentUser: User | undefined = users.get(socket.id);
    if (currentUser == undefined) {
      socket.emit("Join Error", "unable to find the user");
      return;
    }

    console.log("joining a room for", currentUser);
    console.log("room number: ", roomNumber);

    // assign user with the room number and updated the room list
    currentUser.roomNumber = roomNumber;
    theRoom.player.push(currentUser);

    // join the room with the roomNumber
    socket.join(roomNumber);

    socket
      .to(roomNumber)
      .emit("User Joined", theRoom.player[1], theRoom.player[0], roomNumber, 0);
    // send the newRoom back to the client socket
    socket.emit("Joined", theRoom.player[0], theRoom.player[1], roomNumber, 0);
  });

  const endRoomConnection = (user: User) => {
    // if anyone leave or disconnect from the room, every socket will disconnect
    if (user.roomNumber != "") {
      const theRoom = rooms.get(user.roomNumber) as RoomInfo;
      io.in(user.roomNumber).disconnectSockets();
      rooms.delete(user.roomNumber);

      theRoom.player.forEach((player: User) => users.delete(user.id));
    }
  };

  // handle request to leave the room.
  socket.on("leave room", () => {
    const user = users.get(socket.id) as User;
    endRoomConnection(user);
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected :", users.get(socket.id));
    // make sure to room request after disconnect
    const user = users.get(socket.id) as User;
    endRoomConnection(user);
    users.delete(socket.id);
  });
});
