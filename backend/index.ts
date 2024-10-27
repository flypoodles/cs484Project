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

io.on("connection", (socket) => {
  const newUser: User = {
    id: socket.id,
    username: socket.handshake.auth.username,
    roomNumber: "",
  };
  users.set(socket.id, newUser);

  socket.emit("onConnect", newUser);
  socket.emit("message", "you have connected to the server!");

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
      host: users.get(socket.id) as User,
      guest: null,
    };
    rooms.set(roomNumber, newRoom);
    socket.join(roomNumber);

    socket.emit("newRoom", newRoom);
  });

  socket.on("Join Room Request", (roomNumber: string) => {
    if (!rooms.has(roomNumber)) {
      socket.emit("Join Error", "room not found");
      return;
    }

    const theRoom: RoomInfo = rooms.get(roomNumber) as RoomInfo;

    if (theRoom.guest != null) {
      socket.emit("Join Error", "room is full");
      return;
    }
    const currentUser: User | undefined = users.get(socket.id);
    console.log("joining a room for", currentUser);
    console.log("room number: ", roomNumber);

    if (currentUser == undefined) {
      socket.emit("Join Error", "unable to find the user");
      return;
    }

    // assign user with the room number
    currentUser.roomNumber = roomNumber;
    users.set(socket.id, currentUser);

    theRoom.guest = currentUser;
    rooms.set(roomNumber, theRoom);

    socket.join(roomNumber);

    socket.to(roomNumber).emit("User Joined", theRoom);
    socket.emit("Joined", theRoom);
  });

  const endRoomConnection = (user: User) => {
    if (user.roomNumber != "") {
      const theRoom = rooms.get(user.roomNumber) as RoomInfo;
      io.in(user.roomNumber).disconnectSockets();
      rooms.delete(user.roomNumber);

      users.delete(theRoom.host.id);
      if (theRoom.guest != null) {
        users.delete(theRoom.guest.id);
      }
    }
  };
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
