import { User, RoomInfo } from "../type.ts";
import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
interface LobbyProp {
  user: User;
  socket: Socket;
  setRoom: React.Dispatch<React.SetStateAction<RoomInfo | null>>;
}
const Lobby: React.FC<LobbyProp> = ({ user, socket, setRoom }: LobbyProp) => {
  const [joinScreen, setJoinScreen] = useState<boolean>(false);

  const [roomNumber, setRoomNumber] = useState<string>("");
  const handleCreate = () => {
    console.log("creating a room1");
    socket.emit("create", socket.id, () => {
      console.log("hello");
    });

    console.log("creating a room2");
    socket.on("newRoom", (room: RoomInfo) => {
      console.log("you have joined Room : ", room.roomNumber);

      setRoom(room);
    });

    console.log("creating a room");
  };
  const handleJoin = (e: React.FormEvent) => {
    console.log(`join room ${e.target}`);
  };

  return (
    <>
      <h1>Welcome {user.username}</h1>

      {joinScreen ? (
        <form onSubmit={handleJoin}>
          <label htmlFor="productId"></label>
          <input
            type="text"
            value={roomNumber}
            placeholder="Enter room number"
            onChange={(e) => setRoomNumber(e.target.value)}
            required
          />
          <button onClick={() => setJoinScreen(false)}>Back</button>
          <button type="submit">Join</button>
        </form>
      ) : (
        <>
          <button type="button" onClick={() => handleCreate()}>
            create
          </button>
          <button type="button" onClick={() => setJoinScreen(true)}>
            join a room
          </button>
        </>
      )}
    </>
  );
};

export default Lobby;
