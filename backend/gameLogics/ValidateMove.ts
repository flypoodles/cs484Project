import { MoveInfo } from "../type";
import { fenToBoard, updateBoard } from "../util.ts";

interface Result {
  success: boolean;
  err: string;
}
enum faction {
  red = 0,
  black,
}

enum pieceType {
  horse = 1,
  rook,
  pawn,
  elephant,
  king,
  guard,
  cannon,
  unknown,
}

interface PieceInfo {
  faction: faction;
  pieceType: pieceType;
}
export function validateMove(currentState: MoveInfo): Result {
  const board: string[][] = fenToBoard(currentState.board);
  const initialPosition: number[] = currentState.initialPosition;
  const destination: number[] = currentState.destination;
  const pickedPiece: String =
    board[currentState.initialPosition[0]][currentState.initialPosition[1]];

  const destinationPiece: String =
    board[currentState.destination[0]][currentState.destination[1]];

  // make sure the piece is not empty
  if (pickedPiece === "") {
    return { success: false, err: "Empty Piece" };
  }

  // make sure there is no ally in the destination piece
  if (destinationPiece !== "" && destinationPiece[0] === pickedPiece[0]) {
    return { success: false, err: "Cannot move to ally's position" };
  }

  // make sure the final position is different from the initial position
  if (
    initialPosition[0] === destination[0] &&
    initialPosition[1] === destination[1]
  ) {
    return { success: false, err: "same position" };
  }

  const pieceInfo = constructPieceInfo(pickedPiece);
  switch (pieceInfo.pieceType) {
    case pieceType.rook:
      return validateRook(initialPosition, destination, board, pieceInfo);
    case pieceType.pawn:
      return validatePawn(initialPosition, destination, board, pieceInfo);
    case pieceType.horse:
      return validateHorse(initialPosition, destination, board, pieceInfo);
    case pieceType.elephant:
      return validateElephant(initialPosition, destination, board, pieceInfo);
    case pieceType.cannon:
      return validateCannon(initialPosition, destination, board, pieceInfo);
    case pieceType.king:
      return validateKing(initialPosition, destination, board, pieceInfo);
    case pieceType.guard:
      return validateGuard(initialPosition, destination, board, pieceInfo);
  }

  return { success: false, err: "Unknown piece" };
}

// compute the area between the inital and the final position
function getArea(initialPosition: number[], destination: number[]): number {
  return Math.abs(
    (destination[0] - initialPosition[0]) *
      (destination[1] - initialPosition[1])
  );
}

function insidePalace(position: number[], theFaction: faction): boolean {
  const row: number = position[0];
  const column: number = position[1];
  if (theFaction == faction.black) {
    return column >= 3 && column <= 5 && row <= 2 && row >= 0;
  }
  // red
  return column >= 3 && column <= 5 && row <= 9 && row >= 7;
}
function constructPieceInfo(curPiece: String): PieceInfo {
  const Piecefaction = curPiece[0] === "b" ? faction.black : faction.red;
  //rhegkgehr p1p1p1p1p/1c5c1
  const PieceType: pieceType = (function (): pieceType {
    switch (curPiece[1]) {
      case "r":
        return pieceType.rook;

      case "h":
        return pieceType.horse;
      case "e":
        return pieceType.elephant;
      case "p":
        return pieceType.pawn;

      case "k":
        return pieceType.king;
      case "g":
        return pieceType.guard;
      case "c":
        return pieceType.cannon;
      default:
        return pieceType.unknown;
    }
  })();

  return { faction: Piecefaction, pieceType: PieceType };
}

function validateKing(
  initialPosition: number[],
  destination: number[],
  board: string[][],
  piece: PieceInfo
): Result {
  if (board[destination[0]][destination[1]] !== "") {
    const destPiece: PieceInfo = constructPieceInfo(
      board[destination[0]][destination[1]]
    );

    if (destPiece.pieceType == pieceType.king) {
      return flyingking(initialPosition, destination, board);
    }
  }
  if (
    !insidePalace(initialPosition, piece.faction) ||
    !insidePalace(destination, piece.faction)
  ) {
    return { success: false, err: "not inside your own palace" };
  }

  const area: number = getArea(initialPosition, destination);
  console.log("area ", area);

  if (area !== 0) {
    return { success: false, err: "king cannot move diagonally" };
  }

  const xdist = destination[1] - initialPosition[1];
  const ydist = destination[0] - initialPosition[0];

  if (xdist > 1 || ydist > 1) {
    return { success: false, err: "king can only move one step at a time" };
  }
  return { success: true, err: "" };
}

function validateGuard(
  initialPosition: number[],
  destination: number[],
  board: string[][],
  piece: PieceInfo
): Result {
  if (
    !insidePalace(initialPosition, piece.faction) ||
    !insidePalace(destination, piece.faction)
  ) {
    return { success: false, err: "not inside palace" };
  }
  const area: number = getArea(initialPosition, destination);
  console.log("area ", area);
  if (area != 1) {
    return { success: false, err: "guard can only move 1x1 diagonally " };
  }

  return { success: true, err: "" };
}

function validateElephant(
  initialPosition: number[],
  destination: number[],
  board: string[][],
  piece: PieceInfo
): Result {
  console.log("checking Elephant");
  const area: number = getArea(initialPosition, destination);
  console.log("area ", area);

  const xdist = destination[1] - initialPosition[1];
  const ydist = destination[0] - initialPosition[0];
  if (area !== 4 || Math.abs(xdist) !== Math.abs(ydist)) {
    return { success: false, err: "Elephant must move in a 2x2 square" };
  }
  if (piece.faction === faction.black && destination[0] > 4) {
    return { success: false, err: "Elephant cannot cross river" };
  }

  if (piece.faction === faction.red && destination[0] < 5) {
    return { success: false, err: "Elephant cannot cross river" };
  }
  //   let midx = (finPos[0] + intPos[0]) / 2;
  //   let midy = (finPos[1] + intPos[1]) / 2;

  const centerColumn = (destination[1] + initialPosition[1]) / 2;
  const centerRow = (destination[0] + initialPosition[0]) / 2;
  if (board[centerRow][centerColumn] !== "") {
    return {
      success: false,
      err: "Elephant cannot jump over  piece in the middle",
    };
  }
  return { success: true, err: "" };
}
function validateCannon(
  initialPosition: number[],
  destination: number[],
  board: string[][],
  piece: PieceInfo
): Result {
  console.log("checking cannon");
  const area: number = getArea(initialPosition, destination);
  console.log("area ", area);
  if (area !== 0) {
    return { success: false, err: "Cannon cannot move diagonly" };
  }
  const xdist = destination[1] - initialPosition[1];
  const ydist = destination[0] - initialPosition[0];

  let piecesInMiddle: number = 0;
  if (xdist !== 0) {
    const direction = xdist / Math.abs(xdist);
    for (
      let curPos = initialPosition[1] + direction;
      curPos != destination[1];
      curPos += direction
    ) {
      if (board[initialPosition[0]][curPos] !== "") {
        piecesInMiddle++;
      }
    }
  } else if (ydist !== 0) {
    const direction = ydist / Math.abs(ydist);
    for (
      let curPos = initialPosition[0] + direction;
      curPos != destination[0];
      curPos += direction
    ) {
      if (board[curPos][initialPosition[1]] !== "") {
        piecesInMiddle++;
      }
    }
  } else {
    return { success: false, err: "Not supposed to happen" };
  }

  if (piecesInMiddle === 1 && board[destination[0]][destination[1]] !== "") {
    return { success: true, err: "" };
  }
  if (piecesInMiddle === 0 && board[destination[0]][destination[1]] === "") {
    return { success: true, err: "" };
  }
  return { success: false, err: "Invalid Cannon Move" };
}
function validateHorse(
  initialPosition: number[],
  destination: number[],
  board: string[][],
  piece: PieceInfo
): Result {
  console.log("checking horse");
  const area: number = getArea(initialPosition, destination);
  console.log("area ", area);
  if (area !== 2) {
    return { success: false, err: "Invalid horse move" };
  }
  const xdist = destination[1] - initialPosition[1];
  const ydist = destination[0] - initialPosition[0];

  if (Math.abs(xdist) === 2) {
    const direction = xdist / Math.abs(xdist);
    if (board[initialPosition[0]][initialPosition[1] + direction]) {
      return { success: false, err: "Horse is blocked by piece" };
    }
  }
  if (Math.abs(ydist) === 2) {
    const direction = ydist / Math.abs(ydist);
    if (board[initialPosition[0] + direction][initialPosition[1]]) {
      return { success: false, err: "Horse is blocked by piece" };
    }
  }

  return { success: true, err: "" };
}

function validateRook(
  initialPosition: number[],
  destination: number[],
  board: string[][],
  piece: PieceInfo
): Result {
  console.log("checking rook");
  const area: number = getArea(initialPosition, destination);
  console.log("area ", area);
  if (area !== 0) {
    return { success: false, err: "Rook cannot move diagonly" };
  }

  const verticalDistance = destination[0] - initialPosition[0];
  const horizontalDistance = destination[1] - initialPosition[1];

  if (verticalDistance != 0) {
    const direction = verticalDistance / Math.abs(verticalDistance);
    for (
      let curPos = initialPosition[0] + direction;
      curPos != destination[0];
      curPos += direction
    ) {
      if (board[curPos][initialPosition[1]] !== "") {
        return { success: false, err: "piece in middles" };
      }
    }
  } else if (horizontalDistance != 0) {
    const direction = horizontalDistance / Math.abs(horizontalDistance);
    for (
      let curPos = initialPosition[1] + direction;
      curPos != destination[1];
      curPos += direction
    ) {
      if (board[initialPosition[0]][curPos] !== "") {
        return { success: false, err: "piece in middles" };
      }
    }
  } else {
    return { success: false, err: "this should never happen" };
  }

  return { success: true, err: "" };
}

function validatePawn(
  initialPosition: number[],
  destination: number[],
  board: string[][],
  piece: PieceInfo
): Result {
  console.log("checking pawn");
  const area: number = getArea(initialPosition, destination);
  console.log("area ", area);
  if (area !== 0) {
    return { success: false, err: "Pawn cannot move diagonly" };
  }
  const xdist = destination[1] - initialPosition[1];
  const ydist = destination[0] - initialPosition[0];

  if (piece.faction == faction.black && ydist < 0) {
    return { success: false, err: "pawn cannot move backward" };
  }
  if (piece.faction == faction.red && ydist > 0) {
    return { success: false, err: "pawn cannot move backward" };
  }

  if (Math.abs(xdist) > 1 || Math.abs(ydist) > 1) {
    return { success: false, err: "pawn can only move one step at a time" };
  }

  if (
    Math.abs(xdist) === 1 &&
    piece.faction === faction.black &&
    destination[0] < 5
  ) {
    return { success: false, err: "Pawn can only move forward before river" };
  }

  if (
    Math.abs(xdist) === 1 &&
    piece.faction === faction.red &&
    destination[0] > 4
  ) {
    return { success: false, err: "Pawn can only move forward before river" };
  }

  return { success: true, err: "" };
}

function flyingking(
  initialPosition: number[],
  destination: number[],
  board: string[][]
): Result {
  if (destination[1] !== initialPosition[1]) {
    return { success: false, err: "INVALID king move" };
  }

  const ydist = destination[0] - initialPosition[0];

  const direction = ydist / Math.abs(ydist);

  for (
    let curRow = initialPosition[0] + direction;
    curRow != destination[0];
    curRow += direction
  ) {
    if (board[curRow][initialPosition[1]] !== "") {
      return { success: false, err: "INVALID king move" };
    }
  }
  return { success: true, err: "" };
}
