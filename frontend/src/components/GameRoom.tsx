import { User, RoomInfo } from "../type.ts";
import React, { ReactNode, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import Chat from "./Chat.tsx";
interface roomProp {
  socket: Socket;
  room: RoomInfo;
  ishost: boolean;
  setRoom: React.Dispatch<React.SetStateAction<RoomInfo | null>>;
}
const GameRoom: React.FC<roomProp> = ({
  socket,
  room,
  ishost,
  setRoom,
}: roomProp) => {
  const [getPlayer, setPlayer] = useState<User | null>(
    ishost ? room.host : room.guest
  );

  const [getOpponent, setOpponent] = useState<User | null>(
    ishost ? room.guest : room.host
  );
  const [isWaiting, setWaiting] = useState<boolean>(
    room.guest == null ? true : false
  );

  const handleLeaveRoom = () => {
    socket.emit("leave room");
  };
  socket.on("User Joined", (room: RoomInfo) => {
    setRoom(room);
    setWaiting(false);
    setOpponent(ishost ? room.guest : room.host);
  });

  return (
    <>
      {getPlayer != null ? (
        <h1>welcome to the room {getPlayer.username} </h1>
      ) : (
        <h1>Error: player has no username</h1>
      )}
      {isWaiting ? (
        <h1>Waiting for the other player to connect</h1>
      ) : (
        <>
          <h1>other player has connected</h1>
          {getOpponent != null && (
            <h1> your Opponent: {getOpponent.username}</h1>
          )}
        </>
      )}

      {isWaiting && <h1>Use this Number to connect: {room.roomNumber}</h1>}

      {!isWaiting && getPlayer != null && getOpponent != null && (
        <Chat
          user={getPlayer}
          opponent={getOpponent}
          socket={socket}
          room={room}
        />
      )}
      <button onClick={handleLeaveRoom}> leave Room</button>
    </>
  );
};

export default GameRoom;
