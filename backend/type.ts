export interface User {
  id: string;
  username: string;
  roomNumber: string;
}

export interface RoomInfo {
  roomNumber: string;
  player: User[];
  turn: 0;
}

export interface Message {
  sender: User;
  message: string;
}
