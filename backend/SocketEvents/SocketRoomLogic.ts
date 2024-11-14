import { Socket, Server } from "socket.io";
import { User, RoomInfo } from "../type";

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
    if (!rooms.has(roomNumber)) {
      socket.emit("Join Error", "room not found");
      return;
    }

    const theRoom: RoomInfo = rooms.get(roomNumber) as RoomInfo;
    if (theRoom.player.length > 1) {
      socket.emit("Join Error", "room is full");
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

  // handle request to leave the room.
  socket.on("leave room", () => {
    const user = users.get(socket.id) as User;
    console.log(`${user.username} leave room`);

    const theRoom = rooms.get(user.roomNumber);
    // if user is alone in room then disconnect user and delete room
    if (theRoom?.player.length == 1) {
      if (user.roomNumber != "") {
        console.log("leave room: user alone in room");
        socket.disconnect(true); // disconnect user
        users.delete(user.id);
        rooms.delete(user.roomNumber); // delete the room
      }
    }
    // if room has two players then disconnect one user, send gameStatus "end" to the other user
    if (theRoom?.player.length == 2) {
      if (user.roomNumber != "") {
        console.log("leave room: 2 players in room");

        socket.disconnect();
        users.delete(user.id);
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
