import { User, RoomInfo } from "../type.ts";
import React, { ReactEventHandler, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
interface LobbyProp {
  user: User;
  socket: Socket;
  setRoom: React.Dispatch<React.SetStateAction<RoomInfo | null>>;
  setHost: React.Dispatch<React.SetStateAction<boolean>>;
}
const Lobby: React.FC<LobbyProp> = ({
  user,
  socket,
  setRoom,
  setHost,
}: LobbyProp) => {
  const [joinScreen, setJoinScreen] = useState<boolean>(false);

  const [roomNumber, setRoomNumber] = useState<string>("");
  const [joinError, setJoinError] = useState<boolean>(false);
  const [getError, setError] = useState<string>("");
  const handleCreate = () => {
    socket.emit("createRoom");

    socket.on("newRoom", (room: RoomInfo) => {
      console.log("you have joined Room : ", room.roomNumber);

      setHost(true);
      setRoom(room);
    });

    console.log("creating a room");
  };
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    socket.emit("Join Room Request", roomNumber);

    socket.on("Joined", (room: RoomInfo) => {
      setHost(false);
      setRoom(room);
    });

    socket.on("Join Error", (err: string) => {
      setJoinError(true);
      setError(err);
    });
  };

  return (
    <>
      <h1>Welcome {user.username}</h1>

      {joinError && <h1> Join error: {getError}</h1>}
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
