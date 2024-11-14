import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { User, RoomInfo, Message, GameState, MoveInfo } from "./type";
import { endRoomConnection, roomEvent } from "./SocketRoomLogic.ts";
import {
  invertFen,
  normalize,
  retrieveInformation,
  updateBoard,
} from "./util.ts";
const app = express();
const server = createServer(app);

// stores all the users connected to the websocket(socket.io)
const users: Map<string, User> = new Map();

// stores all rooms in the socket
const rooms: Map<string, RoomInfo> = new Map();

const io = new Server(server, {
  cors: {
    origin: ["http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:4173/", "https://cs484finalproject.netlify.app"],
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

  socket.on("ready", () => {
    const { user, room } = retrieveInformation(users, rooms, socket);

    if (user == undefined || room == undefined) {
      console.log("for some reason");
      return;
    }

    room.readyStatus++;
    // only one player is ready
    if (room.readyStatus < 2) {
      console.log("readyStatus < 2");
      socket.to(room.roomNumber).emit("opponent ready");
      return;
    }

    if (room.readyStatus > 2) {
      console.log("readyStatus > 2");
      throw new Error(" ready status greater than 2");
    }

    const colorAssignRandomNumber = Math.floor(Math.random() * 10);

    const newGame: GameState = {
      // board: String;
      // turn: number;
      // red: User;
      // black: User;
      board: "RHEGKGEHR/9/1C5C1/P1P1P1P1P/9/9/p1p1p1p1p/1c5c1/9/rhegkgehr",
      turn: 0,
      red: room.player.at(colorAssignRandomNumber % 2) as User,
      black: room.player.at((colorAssignRandomNumber + 1) % 2) as User,
    };
    room.gameState = newGame;

    // red always move on even number of turn.
    // black always move on odd number of turn.

    console.log(newGame.red.username);
    console.log(newGame.black.username);
    io.to(newGame.red.id).emit(
      "start",
      newGame.turn % 2 ? true : false,
      newGame.turn,
      "red",
      newGame.board
    );
    io.to(newGame.black.id).emit(
      "start",
      newGame.turn % 2 ? false : true,
      newGame.turn,
      "black",
      invertFen(newGame.board)
    );
  });

  socket.onAny((eventName) => console.log(eventName));

  socket.on(
    "move",
    (
      initialPosition: number[],
      destination: number[],
      piece: string,
      playerFen: string
    ) => {
      const { user, room } = retrieveInformation(users, rooms, socket);

      if (user == undefined || room == undefined) {
        return;
      }

      const gameState = room.gameState as GameState;
      const currentPlayer: User =
        gameState.turn % 2 ? gameState.red : gameState.black;
      if (currentPlayer.id != user.id) {
        console.log("the player attempted to move not during their turn");
        socket.emit(
          "move error",
          "the player attempted to move not during their turn"
        );
        return
      }

      const moveInfo: MoveInfo =
        gameState.black.id === currentPlayer.id
          ? normalize(playerFen, initialPosition, destination)
          : {
              destination: destination,
              board: playerFen,
              initialPosition: initialPosition,
            };
      console.log(`initPos: ${initialPosition.toString()}, pos: ${destination.toString()}, piece: ${piece}, boardFen: ${playerFen}`)
      console.log(`player board: ${moveInfo.board}, game state board: ${gameState.board}`)
      if (moveInfo.board !== gameState.board) {
        // throw new Error(
        //   "player's board and game state board does not equal to each other"
        // );
        console.log("player's board and game state board does not equal to each other")
        socket.emit("move error", "player's board and game state board does not equal to each other")
        return
      }
      const validMove: boolean = true; // TODO:implement checking
      
      try {
        const newBoard: string = updateBoard( // this function throws error so we need to catch it
          gameState.board,
          moveInfo.initialPosition,
          moveInfo.destination,
          piece
        );
        gameState.board = newBoard;
        gameState.turn++;
        io.to(gameState.red.id).emit(
          "end turn",
          gameState.turn % 2 ? true : false,
          gameState.turn,
          gameState.board
        );
        io.to(gameState.black.id).emit(
          "end turn",
          gameState.turn % 2 ? false : true,
          gameState.turn,
          invertFen(gameState.board)
        );
      } catch (error) {
        console.log(error)
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("a user disconnected :", users.get(socket.id));
    // make sure to room request after disconnect
    // this is a function from SocketRoomLogic
    // endRoomConnection(io, socket, users, rooms);
    socket.disconnect()
    users.delete(socket.id);
  });
});
