import { Socket, Server } from "socket.io";
import { User, RoomInfo, Message } from "../type.ts";

export function ChatEvent(
  io: Server,
  socket: Socket,
  users: Map<string, User>,
  rooms: Map<string, RoomInfo>
): void {
  socket.on("chat message", (roomNumber: string, msg: Message) => {
    io.to(roomNumber).emit("chat message", msg);
  });
}
