import { User, RoomInfo } from "../type.ts";
import React, { ReactNode, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import Chat from "../components/Chat.tsx";
import { useNavigate } from "react-router-dom";
interface RoomState {
  room: RoomInfo | null;
  setRoom: React.Dispatch<React.SetStateAction<RoomInfo | null>>;
}
interface userState {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}
interface roomProp {
  socket: Socket;
  roomState: RoomState;
  userState: userState;
}
const GameRoom: React.FC<roomProp> = ({
  socket,
  roomState,
  userState,
}: roomProp) => {
  const navigate = useNavigate();
  const [getPlayer, setPlayer] = useState<User>(
    (roomState.room as RoomInfo).player
  );

  const [getOpponent, setOpponent] = useState<User | null>(
    roomState.room != null ? roomState.room.opponent : null
  );

  const [isWaiting, setWaiting] = useState<boolean>(
    // this will first check to make sure roomState is not null.
    // If it is not null, it will execute the nested ternary expression.
    // Else it will return false.
    // the inner ternary check if the opponent is null. The opponent can be null if there is only one player in the room.
    roomState.room != null
      ? roomState.room.opponent == null
        ? true
        : false
      : false
  );

  const handleLeaveRoom = () => {
    socket.emit("leave room");
  };
  socket.on(
    "User Joined",
    (opponent: User | null, player: User, roomNumber: string, turn: number) => {
      const room: RoomInfo = {
        opponent: opponent,
        player: player,
        roomNumber: roomNumber,
        turn: turn,
      };
      roomState.setRoom(room);
      setWaiting(false);
      setOpponent(room.opponent);
    }
  );

  return (
    <>
      {roomState.room != null && userState.user != null ? (
        <>
          {getPlayer != null ? (
            <h1>welcome to the room {roomState.room.player.username} </h1>
          ) : (
            <h1>Error: player has no username</h1>
          )}
          {isWaiting ? (
            <h1>Waiting for the other player to connect</h1>
          ) : (
            <>
              <h1>other player has connected</h1>
              {getOpponent != null ? (
                <h1> your Opponent: {getOpponent.username}</h1>
              ) : (
                <h1>
                  {" "}
                  Error: opponent is null even after other play has joined
                </h1>
              )}
            </>
          )}

          {isWaiting && (
            <h1>Use this Number to connect: {roomState.room.roomNumber}</h1>
          )}

          {!isWaiting && getPlayer != null && getOpponent != null && (
            <Chat
              user={getPlayer}
              opponent={getOpponent}
              socket={socket}
              room={roomState.room}
            />
          )}
          <button onClick={handleLeaveRoom}> leave Room</button>
        </>
      ) : (
        <h1>Error some thing is wrong</h1>
      )}
    </>
  );
};

export default GameRoom;
