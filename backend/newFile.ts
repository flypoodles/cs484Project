import { invertFen, fenToBoard, boardToFen } from "./util.ts";

const inverted = invertFen(
  "RHEGKGEHR/9/1C5C1/P1P1P1P1P/9/9/p1p1p1p1p/1c5c1/9/rhegkgehr"
);

const board: string[][] = fenToBoard(
  "RHEGKGEHR/9/1C5C1/P1P1P1P1P/9/9/p1p1p1p1p/1c5c1/9/rhegkgehr"
);
const board2: string[][] = fenToBoard(inverted);

console.log(boardToFen(board));
console.log(
  boardToFen(board) ===
    "RHEGKGEHR/9/1C5C1/P1P1P1P1P/9/9/p1p1p1p1p/1c5c1/9/rhegkgehr"
);
console.log(boardToFen(board2));
console.log(boardToFen(board2) === inverted);
console.log(inverted);
// rhegkgehr/9/1c5c/p1p1p1p1p/9/9/P1P1P1P1P/1C5C/9/RHEGKGEHR
