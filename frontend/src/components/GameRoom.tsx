import { User, RoomInfo } from "../type.ts";
import React, { ReactNode, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
interface roomProp {
  user: User;
  socket: Socket;
  room: RoomInfo;
  ishost: boolean;
  setRoom: React.Dispatch<React.SetStateAction<RoomInfo | null>>;
}
const GameRoom: React.FC<roomProp> = ({
  user,
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

  socket.on("User Joined", (room: RoomInfo) => {
    setRoom(room);
    setWaiting(false);
    setOpponent(ishost ? room.guest : room.host);
  });
  return (
    <>
      <h1>welcome to the room {user.username} </h1>
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
    </>
  );
};

export default GameRoom;
