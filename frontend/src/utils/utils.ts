import { PieceType } from "../type";

const defaultBoard = "RHEGKGEHR/8/1C5C/P1P1P1P1P/8/8/p1p1p1p1p/1c5c/8/rhegkgehr";

function isCharNumber(c: string) {
  return c >= '0' && c <= '9';
}

interface loadBoardOutput {
  loadSuccessful: boolean;
  board: string[][];
}

// input: fenstring (board portion only, assuming it is always correct)
// output: an object of loadBoardOutput
export function loadBoard(boardString: string = defaultBoard): loadBoardOutput {

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