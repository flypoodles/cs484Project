import { Socket, Server, RemoteSocket } from "socket.io";
import { User, RoomInfo, Status } from "../type";
import { retrieveInformation } from "./UserEvent";

export function roomEvent(
  io: Server,
  socket: Socket,
  users: Map<string, User>,
  rooms: Map<string, RoomInfo>
): void {
  socket.on("createRoom", () => {
    // picking a unique room number
    let roomNumber = generateRoomNumber(rooms);

    const currentUser = users.get(socket.id);
    console.log("creating a room for", currentUser);
    console.log("room number: ", roomNumber);

    if (currentUser == undefined) {
      socket.emit("error", "unable to find the user");
      return;
    }
    currentUser.roomNumber = roomNumber;

    const newRoom: RoomInfo = {
      roomNumber: roomNumber,
      player: [currentUser],
      gameState: null,
      readyStatus: 0,
    };
    rooms.set(roomNumber, newRoom);
    socket.join(roomNumber);

    // send the newRoom back to the client socket
    socket.emit("newRoom", null, newRoom.player[0], roomNumber);
  });

  socket.on("Join Room Request", (roomNumber: string) => {
    const {
      user: currentUser,
      room: theRoom,
      err: err,
    } = retrieveInformation(users, rooms, socket);

    if (theRoom === undefined || currentUser === undefined) {
      socket.emit("Join Error", err);
      return;
    }

    const status: Status = checkJoinRoomCondition(theRoom, socket);
    if (!status.success) {
      socket.emit("Join Error", status.err);
    }

    JoinRoom(socket, roomNumber, theRoom, currentUser);
  });

  socket.on("JoinAnyRoomRequest", () => {
    // get the first room that is available
    let availableRoom: RoomInfo | null | undefined = findAvaliableRoom(
      rooms,
      socket
    );
    if (!availableRoom) {
      // if there is no available room then send join room failed
      console.log("There is no room to join");
      socket.emit("Join Error", "There is no room to join");
      return;
    }
    console.log(availableRoom);

    // Add user to the room
    const roomNumber = availableRoom.roomNumber;
    const currentUser: User | undefined = users.get(socket.id);
    if (currentUser === undefined) {
      socket.emit("Join Error", "unable to find the user");
      return;
    }
    JoinRoom(socket, roomNumber, availableRoom, currentUser);
  });

  // handle request to leave the room.
  socket.on("leave room", () => {
    console.log("leave room : id ", socket.id);
    const user = users.get(socket.id) as User;
    console.log(`${user.username} leave room`);

    const theRoom = rooms.get(user.roomNumber);
    if (!theRoom) {
      console.log("leave room: the user is not in any room");
      return;
    }

    // if user is alone in room then delete room
    socket.leave(user.roomNumber);
    if (theRoom?.player.length == 1) {
      if (user.roomNumber != "") {
        console.log("leave room: user alone in room");
        rooms.delete(user.roomNumber); // delete the room
        user.roomNumber = "";
      }
    }
    // if room has two players then send gameStatus "end" to the other user
    if (theRoom?.player.length == 2) {
      if (user.roomNumber != "") {
        console.log("leave room: 2 players in room");
        user.roomNumber = "";
        theRoom.readyStatus = 0;
        theRoom.player = theRoom.player.filter((usr) => usr.id != user.id);
        const otherSocket = theRoom.player[0].id;
        console.log(otherSocket);
        io.to(otherSocket).emit("opponent leave");
      }
    }
  });
}

export function endRoomConnection(
  io: Server,
  rooms: Map<string, RoomInfo>,
  user: User
): void {
  const theRoom: RoomInfo | undefined = rooms.get(user.roomNumber);
  if (theRoom !== undefined) {
    // if the user disconnect when play with other player then notify that other player
    if (theRoom?.player.length == 2) {
      if (user.roomNumber !== "") {
        console.log("user disconnect, notify his opponent in disconnect");
        theRoom.readyStatus = 0;
        theRoom.player = theRoom.player.filter((usr) => usr.id != user.id);
        const otherSocket: string = theRoom.player[0].id;
        console.log(otherSocket);
        io.to(otherSocket).emit("opponent leave");
      }
    } else {
      if (user.roomNumber !== "") {
        console.log(`user leaves: ${theRoom?.roomNumber}. Delete room`);
        rooms.delete(user.roomNumber);
      }
    }
  }
}
function generateRoomNumber(rooms: Map<string, RoomInfo>): string {
  let roomNumber = Math.random().toString(36).substring(2, 7);
  while (rooms.has(roomNumber)) {
    roomNumber = Math.random().toString(36).substring(2, 7);
  }
  return roomNumber;
}

function checkJoinRoomCondition(theRoom: RoomInfo, socket: Socket): Status {
  if (theRoom.player.length > 1) {
    return { success: false, err: "room is full" };
  }
  if (theRoom.player[0].id == socket.id) {
    // prevent two sockets that have similar id to join the same room
    return { success: false, err: "You are currently in that room!" };
  }
  return { success: true, err: "" };
}

function findAvaliableRoom(
  rooms: Map<string, RoomInfo>,
  socket: Socket
): RoomInfo | undefined {
  for (const roomId of rooms.keys()) {
    const currRoom = rooms.get(roomId);
    if (currRoom?.player.length === 1) {
      if (currRoom.player[0].id !== socket.id) {
        // not allow the socket to join the room that the socket is already in
        return currRoom;
      }
    }
  }
  return undefined;
}

function JoinRoom(
  socket: Socket,
  roomNumber: string,
  room: RoomInfo,
  user: User
) {
  console.log("joining a room for", user);
  console.log("room number: ", roomNumber);

  // assign user with the room number and updated the room list
  user.roomNumber = roomNumber;
  room.player.push(user);

  // join the room with the roomNumber
  socket.join(roomNumber);
  socket
    .to(roomNumber)
    .emit("User Joined", room.player[1], room.player[0], roomNumber);
  // send the newRoom back to the client socket
  socket.emit("Joined", room.player[0], room.player[1], roomNumber);
}
