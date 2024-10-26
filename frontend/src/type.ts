export interface User {
  id: string;
  username: string;
}

export interface RoomInfo {
  roomNumber: string;
  playerInfo: User[];
}
