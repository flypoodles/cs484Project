import { Socket, Server } from "socket.io";
import { User, RoomInfo, GameState, MoveInfo, Status } from "../type.ts";
import {
  getTheDeadPiece,
  invertFen,
  normalize,
  updateBoard,
} from "../GameLogic/boardLogic.ts";
import { validateMove, checkKing } from "../GameLogic/ValidateMove.ts";
import { retrieveInformation } from "./UserEvent.ts";

export function GameEvent(
  io: Server,
  socket: Socket,
  users: Map<string, User>,
  rooms: Map<string, RoomInfo>
): void {
  socket.on("ready", () => {
    const { user, room, err } = retrieveInformation(users, rooms, socket);

    if (user == undefined || room == undefined) {
      socket.emit("error", err);
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

    room.gameState = initializeGameState(room);

    // red always move on even number of turn.
    // black always move on odd number of turn.

    notifyPlayerToStart(io, room.gameState);
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
        console.log("for some reason");
        return;
      }

      const gameState: GameState = room.gameState as GameState;
      const currentPlayer: User =
        gameState.turn % 2 ? gameState.red : gameState.black;

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

      const curStatus: Status = validateState(
        moveInfo,
        gameState,
        currentPlayer,
        user
      );
      if (!curStatus.success) {
        socket.emit("move error", curStatus.err);
        return;
      }

      try {
        const newBoard: string = updateBoard(
          // this function throws error so we need to catch it
          gameState.board,
          moveInfo.initialPosition,
          moveInfo.destination,
          piece
        );

        const deadPiece: string = getTheDeadPiece(moveInfo);
        if (deadPiece !== "") {
          gameState.deadPieces.push(deadPiece);
          // Server sent (“end”, winner: “red” or “black”,red ,black, turn, board, list of dead pieces )
          if (deadPiece !== "" && (deadPiece === "rk" || deadPiece === "bk")) {
            EndGame(io, deadPiece, newBoard, gameState, room);
            return;
          }
        }

        // see if the piece at the new location checked the king or not
        const check: boolean =
          checkKing(newBoard, "r") || checkKing(newBoard, "b");
        updateTheGame(io, gameState, newBoard, check);
      } catch (error) {
        console.log(error);
      }
    }
  );
}

function EndGame(
  io: Server,
  deadPiece: string,
  newBoard,
  gameState: GameState,
  room: RoomInfo
) {
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
  room.readyStatus = 0; // reset ready status
}

function updateTheGame(
  io: Server,
  gameState: GameState,
  newBoard: string,
  check: boolean
) {
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
}

function validateState(
  moveInfo: MoveInfo,
  gameState: GameState,
  currentPlayer: User,
  user: User
): Status {
  if (currentPlayer.id != user.id) {
    console.log("the player attempted to move not during their turn");
    return {
      success: false,
      err: "the player attempted to move not during their turn",
    };
  }
  if (moveInfo.board !== gameState.board) {
    console.log(
      "player's board and game state board does not equal to each other"
    );

    return {
      success: false,
      err: "player's board and game state board does not equal to each other",
    };
  }
  const validMove: { success: boolean; err: string } = validateMove(moveInfo);

  if (!validMove.success) {
    console.log(
      `player: ${currentPlayer.username}  move error : ${validMove.err}`
    );
  }
  return validMove;
}

function notifyPlayerToStart(io: Server, newGame: GameState) {
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
}

function initializeGameState(room: RoomInfo): GameState {
  const colorAssignRandomNumber = Math.floor(Math.random() * 10);

  const newGame: GameState = {
    board: "RHEGKGEHR/9/1C5C1/P1P1P1P1P/9/9/p1p1p1p1p/1c5c1/9/rhegkgehr",
    turn: 0,
    red: room.player.at(colorAssignRandomNumber % 2) as User,
    black: room.player.at((colorAssignRandomNumber + 1) % 2) as User,
    deadPieces: [],
    finished: false,
  };
  return newGame;
}
