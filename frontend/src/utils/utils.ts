import { PieceType } from "../type";

function isCharNumber(c: string) {
  return c >= '0' && c <= '9';
}

interface loadBoardOutput {
  loadSuccessful: boolean;
  board: string[][];
}

// input: fenstring (board portion only, assuming it is always correct)
// output: an object of loadBoardOutput
export function fenToBoard(boardString: string): loadBoardOutput {

  const board: string[][] = new Array(10).fill("").map(() => new Array(9).fill("")) // array
  // process boardString to populare board array
  let curRow = 0;
  let curCol = 0;
  for (let i = 0; i < boardString.length; i++) {
    const pos = boardString[i]
    if (pos === "/") { // move to new row
      curCol = 0;
      curRow++
    } else if (isCharNumber(pos)) { // number means skipping spaces
      curCol += parseInt(pos);
    } else if (pos === pos.toUpperCase()) { // black
      board[curRow][curCol] = "b" + pos.toLowerCase()
      curCol++;
    } else if (pos === pos.toLowerCase()) { // red
      board[curRow][curCol] = "r" + pos.toLowerCase();
      curCol++;
    } else {
      alert ("load board failed");
      return {loadSuccessful: false, board: []}
    }
  }
  return {loadSuccessful: true, board: board};
}

export function comparePiece(piece1: PieceType, piece2: PieceType) {
  if ((piece1.piece !== piece2.piece) || (piece1.row !== piece2.row) || (piece1.col !== piece2.col)) {
    return false
  }
  return true
}

export function copyBoard(board: string[][]) {
  const newBoard: string[][] = []
  for (const row of board) {
    const newRow = [...row]
    newBoard.push(newRow)
  }
  return newBoard
}

// same as backend boardToFen
export function boardToFen(board: string[][]): string {
  let fen = "";

  console.log(board)
  for (let i = 0; i < board.length; i++) {
    let count = 0;
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] == "") {
        count++;
      } else {
        if (count != 0) {
          fen = fen.concat(count.toString());
          count = 0;
        }
        const pieceLetter = (board[i][j][0] === "r")? board[i][j][1] : board[i][j][1].toUpperCase() // red is lowercase, black is uppercase
        console.log(board[i][j], pieceLetter)
        fen = fen.concat(pieceLetter);
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

// divide deadpieces string into two array: player and opponent
export function processDeadpiecesStr(deadpieces: string, side: string) { // side is either red or black, a piece begins with a side and end with object. e.g. bc --- "black cannon"
  const arr = deadpieces.split(" ")
  const opponentPieces = arr.filter(piece => piece[0] !== side[0])
  const playerPieces = arr.filter(piece => piece[0] === side[0])
  return {
    "opponentDeadPieces": opponentPieces, 
    "playerDeadPieces": playerPieces
  }
} 