export interface User {
  id: string;
  username: string;
  roomNumber: string;
}

export interface RoomInfo {
  roomNumber: string;
  host: User;
  guest: User | null;
}

export interface Message {
  sender: User;
  message: string;
}
