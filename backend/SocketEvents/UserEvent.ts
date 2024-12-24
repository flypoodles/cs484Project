import { Socket, Server } from "socket.io";
import { User, RoomInfo, Message } from "../type.ts";
import { endRoomConnection } from "./SocketRoomLogic.ts";

export function UserEvent(
  io: Server,
  socket: Socket,
  users: Map<string, User>,
  rooms: Map<string, RoomInfo>
): void {
  socket.on("sign-out", () => {
    const theDisconnectEmail: string = users.get(socket.id)?.email as string;
    for (const userId of users.keys()) {
      const currentUser = users.get(userId) as User;
      if (currentUser?.email === theDisconnectEmail) {
        console.log("a user disconnected :", currentUser);

        endRoomConnection(io, rooms, currentUser);
        console.log("deleted id signout : ", currentUser.id);
        users.delete(currentUser?.id);
      }
    }
    io.in(theDisconnectEmail).disconnectSockets();
  });
  socket.on("disconnect", () => {
    const user = users.get(socket.id) as User;

    if (!user) {
      return;
    }
    console.log("a user disconnected :", user);

    // make sure to room request after disconnect
    // this is a function from SocketRoomLogic
    // socket.disconnect();
    endRoomConnection(io, rooms, user);

    // delete user
    console.log("deleted id disconnect: ", socket.id);
    users.delete(socket.id);
  });
}

export function retrieveInformation(
  users: Map<string, User>,
  rooms: Map<String, RoomInfo>,
  socket: Socket
): { user: User | undefined; room: RoomInfo | undefined; err: string } {
  const user = users.get(socket.id);
  if (user == undefined) {
    socket.emit("error", "cannot find user when ready");
    return {
      user: undefined,
      room: undefined,
      err: "cannot find user when ready",
    };
  }

  const room = rooms.get(user.roomNumber);

  if (room == undefined) {
    socket.emit("error", "room does not exit for the user");
    return {
      user: undefined,
      room: undefined,
      err: "room does not exit for the user",
    };
  }

  return { user: user, room: room, err: "" };
}
