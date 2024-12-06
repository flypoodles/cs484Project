import { Socket, Server } from "socket.io";
import { User, RoomInfo, GameState, MoveInfo } from "../type.ts";
import { updateSpeculator } from "./SocketRoomLogic.ts";
import {
  getTheDeadPiece,
  invertFen,
  normalize,
  retrieveInformation,
  updateBoard,
} from "../util.ts";
import { validateMove, checkKing } from "../gameLogics/ValidateMove.ts";

export const GameEvent = (
  io: Server,
  socket: Socket,
  users: Map<string, User>,
  rooms: Map<string, RoomInfo>
) => {
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
      deadPieces: [],
      finished: false,
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
    updateSpeculator(io, room.roomNumber, rooms);
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

      const gameState: GameState = room.gameState as GameState;
      const currentPlayer: User =
        gameState.turn % 2 ? gameState.red : gameState.black;
      if (currentPlayer.id != user.id) {
        console.log("the player attempted to move not during their turn");
        socket.emit(
          "move error",
          "the player attempted to move not during their turn"
        );
        return;
      }

      const moveInfo: MoveInfo =
        gameState.black.id === currentPlayer.id
          ? normalize(playerFen, initialPosition, destination)
          : {
              destination: destination,
              board: playerFen,
              initialPosition: initialPosition,
            };
      console.log(
        `initPos: ${initialPosition.toString()}, pos: ${destination.toString()}, piece: ${piece}, boardFen: ${playerFen}`
      );
      console.log(
        `player board: ${moveInfo.board}, game state board: ${gameState.board}`
      );
      if (moveInfo.board !== gameState.board) {
        // throw new Error(
        //   "player's board and game state board does not equal to each other"
        // );
        console.log(
          "player's board and game state board does not equal to each other"
        );
        socket.emit(
          "move error",
          "player's board and game state board does not equal to each other"
        );
        return;
      }
      const validMove: { success: boolean; err: string } =
        validateMove(moveInfo);

      if (!validMove.success) {
        console.log(
          `player: ${currentPlayer.username}  move error : ${validMove.err}`
        );
        socket.emit("move error", validMove.err);
        return;
      }

      try {
        const deadPiece: string = getTheDeadPiece(moveInfo);
        if (deadPiece !== "") {
          gameState.deadPieces.push(deadPiece);
        }

        const newBoard: string = updateBoard(
          // this function throws error so we need to catch it
          gameState.board,
          moveInfo.initialPosition,
          moveInfo.destination,
          piece
        );

        // Server sent (“end”, winner: “red” or “black”,red ,black, turn, board, list of dead pieces )
        if (deadPiece !== "") {
          if (deadPiece === "rk" || deadPiece === "bk") {
            const winner = deadPiece === "rk" ? "black" : "red";
            gameState.board = newBoard;
            gameState.turn++;
            io.to(room.roomNumber).emit(
              "end",
              winner,
              room.gameState?.red.username,
              room.gameState?.black.username,
              gameState.turn,
              gameState.board,
              gameState.deadPieces.join(" ")
            );
            updateSpeculator(io, room.roomNumber, rooms, true, winner);
            room.readyStatus = 0; // reset ready status
            return;
          }
        }

        // see if the piece at the new location checked the king or not
        const check: boolean =
          checkKing(newBoard, "r") || checkKing(newBoard, "b");

        gameState.board = newBoard;
        gameState.turn++;
        io.to(gameState.red.id).emit(
          "end turn",
          gameState.turn % 2 ? true : false,
          gameState.turn,
          gameState.board,
          gameState.deadPieces.join(" "),
          check
        );
        io.to(gameState.black.id).emit(
          "end turn",
          gameState.turn % 2 ? false : true,
          gameState.turn,
          invertFen(gameState.board),
          gameState.deadPieces.join(" "),
          check
        );
        updateSpeculator(io, room.roomNumber, rooms);
      } catch (error) {
        console.log(error);
      }
    }
  );
};
