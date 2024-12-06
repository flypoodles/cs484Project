import { Socket, Server } from "socket.io";
import { User, RoomInfo, GameState } from "../type";

export const roomEvent = (
  io: Server,
  socket: Socket,
  users: Map<string, User>,
  rooms: Map<string, RoomInfo>
) => {
  socket.on("createRoom", () => {
    // picking a unique room number
    let roomNumber = Math.random().toString(36).substring(2, 7);
    while (rooms.has(roomNumber)) {
      roomNumber = Math.random().toString(36).substring(2, 7);
    }

    const currentUser = users.get(socket.id);
    console.log("creating a room for", currentUser);
    console.log("room number: ", roomNumber);

    if (currentUser == undefined) {
      socket.emit("error", "unable to find the user");
      return;
    }
    currentUser.roomNumber = roomNumber;
    users.set(socket.id, currentUser);

    const newRoom: RoomInfo = {
      roomNumber: roomNumber,
      speculateRoomNumber: roomNumber + "-speculate",
      player: [currentUser],
      gameState: null,
      readyStatus: 0,
      speculator: [],
    };

    rooms.set(roomNumber, newRoom);
    socket.join(roomNumber);

    // send the newRoom back to the client socket
    socket.emit("newRoom", null, newRoom.player[0], roomNumber);
  });

  socket.on("Join Room Request", (roomNumber: string) => {
    if (!rooms.has(roomNumber)) {
      socket.emit("Join Error", "room not found");
      return;
    }

    const theRoom: RoomInfo = rooms.get(roomNumber) as RoomInfo;
    if (theRoom.player.length > 1) {
      socket.emit("Join Error", "room is full");
      return;
    }

    if (theRoom.player[0].id == socket.id) {
      // prevent two sockets that have similar id to join the same room
      socket.emit("Join Error", "You are currently in that room!");
      return;
    }

    const currentUser: User | undefined = users.get(socket.id);
    if (currentUser == undefined) {
      socket.emit("Join Error", "unable to find the user");
      return;
    }

    console.log("joining a room for", currentUser);
    console.log("room number: ", roomNumber);

    // assign user with the room number and updated the room list
    currentUser.roomNumber = roomNumber;
    theRoom.player.push(currentUser);

    // join the room with the roomNumber
    socket.join(roomNumber);

    socket
      .to(roomNumber)
      .emit("User Joined", theRoom.player[1], theRoom.player[0], roomNumber);
    // send the newRoom back to the client socket
    socket.emit("Joined", theRoom.player[0], theRoom.player[1], roomNumber);
  });

  socket.on("JoinAnyRoomRequest", () => {
    // get the first room that is available
    let availableRoom: RoomInfo | null | undefined = null;
    for (const roomId of rooms.keys()) {
      const currRoom = rooms.get(roomId);
      if (currRoom?.player.length === 1) {
        if (currRoom.player[0].id !== socket.id) {
          // not allow the socket to join the room that the socket is already in
          availableRoom = currRoom;
          break;
        }
      }
    }
    if (!availableRoom) {
      // if there is no available room then send join room failed
      console.log("There is no room to join");
      socket.emit("Join Error", "There is no room to join");
      return;
    }

    // Add user to the room
    const roomNumber = availableRoom.roomNumber;
    const currentUser: User | undefined = users.get(socket.id);
    if (currentUser == undefined) {
      socket.emit("Join Error", "unable to find the user");
      return;
    }

    console.log("joining a room for", currentUser);
    console.log("room number: ", roomNumber);

    // assign user with the room number and updated the room list
    currentUser.roomNumber = roomNumber;
    availableRoom.player.push(currentUser);

    // join the room with the roomNumber
    socket.join(roomNumber);

    socket
      .to(roomNumber)
      .emit(
        "User Joined",
        availableRoom.player[1],
        availableRoom.player[0],
        roomNumber
      );
    // send the newRoom back to the client socket
    socket.emit(
      "Joined",
      availableRoom.player[0],
      availableRoom.player[1],
      roomNumber
    );
  });

  socket.on("speculate", (roomNumber: string) => {
    if (!rooms.has(roomNumber)) {
      socket.emit("Join Error", "room not found");
      return;
    }

    const theRoom: RoomInfo = rooms.get(roomNumber) as RoomInfo;
    const currentUser: User | undefined = users.get(socket.id);
    if (currentUser == undefined) {
      socket.emit("Join Error", "unable to find the user");
      return;
    }

    console.log("join a room to speculate for", currentUser);
    console.log("room number: ", roomNumber);

    currentUser.roomNumber = roomNumber;
    theRoom.speculator.push(currentUser);
    socket.join(theRoom.speculateRoomNumber);

    // emit sucesss
    socket.to(theRoom.roomNumber).emit("speculator-join", theRoom.speculator);
    socket
      .to(theRoom.speculateRoomNumber)
      .emit("speculator-join", theRoom.speculator);

    socket.emit("speculator-joined", theRoom.player);

    if (theRoom.gameState != null) {
      updateSpeculator(io, roomNumber, rooms);
    }
  });

  socket.on("speculate-leave", () => {
    const user = users.get(socket.id) as User;

    const theRoom = rooms.get(user.roomNumber) as RoomInfo;
    theRoom.speculator = theRoom.speculator.filter((curUser: User) => {
      curUser.id != user.id;
    });
    socket.leave(user.roomNumber);
    user.roomNumber = "";
    console.log(`spectator ${user.username} has left the room`);
  });

  // handle request to leave the room.
  socket.on("leave room", () => {
    const user = users.get(socket.id) as User;
    console.log(`${user.username} leave room`);

    const theRoom = rooms.get(user.roomNumber);
    // if user is alone in room then delete room
    if (theRoom?.player.length == 1) {
      if (user.roomNumber != "") {
        socket.leave(user.roomNumber);
        console.log("leave room: user alone in room");
        rooms.delete(user.roomNumber); // delete the room
        user.roomNumber = "";
      }
    }
    // if room has two players then send gameStatus "end" to the other user
    if (theRoom?.player.length == 2) {
      if (user.roomNumber != "") {
        console.log("leave room: 2 players in room");
        socket.leave(user.roomNumber);
        user.roomNumber = "";
        theRoom.readyStatus = 0;
        theRoom.player = theRoom.player.filter((usr) => usr.id != user.id);

        const otherSocket = theRoom.player[0].id;
        console.log(otherSocket);
        io.to(otherSocket).emit("opponent leave");
      }
    }
    //endRoomConnection(io, socket, users, rooms);
  });
};

export function updateSpeculator(
  io: Server,
  roomNumber: string,
  rooms: Map<string, RoomInfo>,
  end: boolean = false,
  winner: string = "none"
) {
  if (!rooms.has(roomNumber)) {
    console.log("UPDATE SPECTATOR: room does not exist");
    return;
  }

  const theRoom: RoomInfo = rooms.get(roomNumber) as RoomInfo;
  const gameSatus: GameState = theRoom.gameState as GameState;
  if (!end) {
    io.to(theRoom.speculateRoomNumber).emit(
      "speculator-update",
      gameSatus.red.username,
      gameSatus.black.username,
      gameSatus.turn,
      gameSatus.board,
      gameSatus.deadPieces.join(" ")
    );
  } else {
    // if the game end

    io.to(theRoom.speculateRoomNumber).emit(
      "speculator-end",
      gameSatus.red.username,
      gameSatus.black.username,
      gameSatus.turn,
      gameSatus.board,
      gameSatus.deadPieces.join(" "),
      winner
    );
  }
}
export const endRoomConnection = (
  io: Server,
  socket: Socket,
  users: Map<String, User>,
  rooms: Map<string, RoomInfo>
) => {
  // if anyone leave or disconnect from the room, every socket will disconnect
  const user = users.get(socket.id) as User;
  console.log("end room connection");
  if (user.roomNumber != "") {
    const theRoom = rooms.get(user.roomNumber) as RoomInfo;
    io.in(user.roomNumber).disconnectSockets();
    rooms.delete(user.roomNumber);

    theRoom.player.forEach((player: User) => users.delete(user.id));
  }
};
