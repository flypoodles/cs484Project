export interface User {
  id: string;
  username: string;
  roomNumber: string;
}

// this is different from server
export interface RoomInfo {
  roomNumber: string;
  opponent: User | null;
  player: User;
}

export interface Message {
  sender: User;
  message: string;
}

export interface PieceType {
  piece: string;
  row: number; // 0 -> 9
  col: number; // 0 -> 8
}

export interface Move {
  piece: string;
  from: [number, number]; // row, col
  to: [number, number]; // row, col
}

export interface UserProfile { // profile store in firestore db
  email: string,
  username: string,
  photo: string,
}