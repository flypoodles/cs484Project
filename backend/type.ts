export interface User {
  id: string;
  username: string;
  roomNumber: string;
}

export interface RoomInfo {
  roomNumber: string;
  player: User[];
  gameState: GameState | null;
  readyStatus: number;
}

export interface Message {
  sender: User;
  message: string;
}

export interface GameState {
  board: string;
  turn: number;
  red: User;
  black: User;
  deadPieces: string[];
  finished: boolean;
}

export interface MoveInfo {
  initialPosition: number[];
  destination: number[];
  board: string;
}
