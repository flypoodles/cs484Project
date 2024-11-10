import { Socket } from "socket.io";
import { RoomInfo, User } from "./type";

export const invertFen: (str: string) => string = (fen: string) => {
  const newFen = fen
    .split("/")
    .map((row: string) => {
      let count: number = 0;
      row.split("").forEach((char) => {
        if (char >= "0" && char <= "9") {
          count += parseInt(char);
        } else {
          count += 1;
        }
      });

      const remainSpace = 9 - count;
      if (remainSpace < 0) {
        throw new Error("remain space is negative");
      }

      let newRow = "";

      if (remainSpace == 0) {
        newRow = row.split("").reverse().join("");
      } else {
        newRow = (row + remainSpace).split("").reverse().join("");
      }
      if (
        newRow.length > 1 &&
        newRow.charAt(newRow.length - 1) >= "0" &&
        newRow.charAt(newRow.length - 1) <= "9"
      ) {
        return newRow.slice(0, -1);
      }
      return newRow;
    })
    .reverse()
    .join("/");
  return newFen;
};

export const retrieveInformation = (
  users: Map<string, User>,
  rooms: Map<String, RoomInfo>,
  socket: Socket
) => {
  const user = users.get(socket.id);
  if (user == undefined) {
    socket.emit("error", "cannot find user when ready");
    return { user: null, room: null };
  }

  const room = rooms.get(user.roomNumber);

  if (room == undefined) {
    socket.emit("error", "room does not exit for the user");
    return { user: null, room: null };
  }

  return { user: user, room: room };
};

export const updateBoard = (
  fen: string,
  initialPosition: number[],
  destination: number[],
  piece: string
) => {
  return "";
};
