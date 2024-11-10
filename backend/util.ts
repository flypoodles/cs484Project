import { Socket } from "socket.io";
import { RoomInfo, User, MoveInfo } from "./type";

export const invertFen: (str: string) => string = (fen: string) => {
  const newFen = fen
    .split("/")
    .map((row: string) => {
      return row.split("").reverse().join("");
    })
    .reverse()
    .join("/");
  return newFen;
};

export const retrieveInformation = (
  users: Map<string, User>,
  rooms: Map<String, RoomInfo>,
  socket: Socket
) => {
  const user = users.get(socket.id);
  if (user == undefined) {
    socket.emit("error", "cannot find user when ready");
    return { user: null, room: null };
  }

  const room = rooms.get(user.roomNumber);

  if (room == undefined) {
    socket.emit("error", "room does not exit for the user");
    return { user: null, room: null };
  }

  return { user: user, room: room };
};

export const updateBoard: (
  fen: string,
  initialPosition: number[],
  destination: number[],
  piece: string
) => string = (
  fen: string,
  initialPosition: number[],
  destination: number[],
  piece: string
) => {
  const board: string[][] = fenToBoard(fen);
  if (board[initialPosition[0]][initialPosition[1]] !== piece) {
    throw new Error("piece not equal");
  }

  board[destination[0]][destination[1]] = piece;
  board[initialPosition[0]][initialPosition[1]] = "";
  return boardToFen(board);
};

const isCharNumber = (c: string) => {
  return c >= "0" && c <= "9";
};

export const fenToBoard = (fen: string) => {
  const board: string[][] = new Array(10)
    .fill("")
    .map(() => new Array(9).fill("")); // array
  // process boardString to populare board array
  let curRow = 0;
  let curCol = 0;
  for (let i = 0; i < fen.length; i++) {
    const pos = fen[i];
    if (pos === "/") {
      // move to new row
      curCol = 0;
      curRow++;
    } else if (isCharNumber(pos)) {
      // number means skipping spaces
      curCol += parseInt(pos);
    } else if (pos === pos.toUpperCase() || pos === pos.toLowerCase()) {
      // black
      board[curRow][curCol] = pos;
      curCol++;
    } else {
      throw new Error("error while creating the board");
    }
  }

  return board;
};

export const boardToFen: (board: string[][]) => string = (
  board: string[][]
) => {
  let fen = "";

  let count = 0;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] == "") {
        count++;
      } else if (count != 0) {
        fen = fen.concat(count.toString());
        fen = fen.concat(board[i][j]);
        count = 0;
      } else {
        fen = fen.concat(board[i][j]);
      }
    }
    if (count != 0) {
      fen = fen.concat(count.toString());
      count = 0;
    }
    if (i < board.length - 1) {
      fen = fen.concat("/");
    }
  }
  return fen;
};

export const normalize = (
  board: string,
  initialPosition: number[],
  destination: number[]
) => {
  const normalizedBoard = invertFen(board);
  const newInitial: number[] = [];
  const newdest: number[] = [];
  newInitial.push(9 - initialPosition[0]);
  newInitial.push(8 - initialPosition[1]);
  newdest.push(9 - destination[0]);
  newdest.push(8 - destination[1]);

  const moveInfo: MoveInfo = {
    initialPosition: newInitial,
    destination: newdest,
    board: normalizedBoard,
  };
  return moveInfo;
};
