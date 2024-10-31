import { PieceType } from "../type";

const defaultBoard = "RHEGKGEHR/8/1C5C/P1P1P1P1P/8/8/p1p1p1p1p/1c5c/8/rhegkgehr b 0";

function isCharNumber(c: string) {
  return c >= '0' && c <= '9';
}

interface loadBoardOutput {
  loadSuccessful: boolean;
  board: string[][];
  curPlayer: "r" | "b" | "";
  curTurn: number
}

// input: fenstring
// output: an object of loadBoardOutput
export function loadBoard(boardString: string = defaultBoard): loadBoardOutput {

  const gameInfo = boardString.split(" ");
  const curPlayer = gameInfo[1]
  if ((curPlayer != "r") && (curPlayer != "b")) {
    alert("unknow Error(loadBoard)")
    return {loadSuccessful: false, board: [], curPlayer: "", curTurn: 0}
  }
  const curTurn = parseInt(gameInfo[2]);
  const curBoard = gameInfo[0]; // fen-string
  
  const board: string[][] = new Array(10).fill("").map(() => new Array(9).fill("")) // array
  // process boardString to populare board array
  let curRow = 0;
  let curCol = 0;
  for (let i = 0; i < curBoard.length; i++) {
    const pos = curBoard[i]
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
      return {loadSuccessful: false, board: [], curPlayer: "", curTurn: 0}
    }
  }
  return {loadSuccessful: true, board: board, curPlayer: curPlayer, curTurn: curTurn};
}

export function comparePiece(piece1: PieceType, piece2: PieceType) {
  if ((piece1.piece !== piece2.piece) || (piece1.row !== piece2.row) || (piece1.col !== piece2.col)) {
    return false
  }
  return true
}

export function copyBoard(board: string[][]) {
  console.log("inside copyBoard")
  const newBoard: string[][] = []
  for (const row of board) {
    const newRow = [...row]
    newBoard.push(newRow)
  }
  console.log(newBoard)

  return newBoard
}