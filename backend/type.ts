export interface User {
  id: string;
  username: string;
  roomNumber: string;
}

export interface RoomInfo {
  roomNumber: string;
  player: User[];
}

export interface Message {
  sender: User;
  message: string;
}
