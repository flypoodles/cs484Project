import { User, RoomInfo } from "../type.ts";
import React, { ReactNode, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import Chat from "../components/Chat.tsx";
import { useNavigate } from "react-router-dom";

import Board from "../components/Board.tsx";

interface RoomState {
  room: RoomInfo;
  setRoom: React.Dispatch<React.SetStateAction<RoomInfo>>;
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
  const [player, setPlayer] = useState<User>((roomState.room as RoomInfo).player);
  const [opponent, setOpponent] = useState<User | null>(roomState.room != null ? roomState.room.opponent : null);
  const [board, setBoard] = useState<string[][]>([])
  const [side, setSide] = useState<"r" | "b" | "">("")
  const [turn, setTurn] = useState(0)
  const [move, setMove] = useState<Move | null>(null)

  // waiting = true if there is no opponent, otherwise false
  const [waiting, setWaiting] = useState<boolean>(
    roomState.room.opponent == null ? true : false
  );

  const handleLeaveRoom = () => {
    socket.emit("leave room");
  };

  socket.on(
    "User Joined",
    (opponent: User | null, player: User, roomNumber: string) => {
      const room: RoomInfo = {
        opponent: opponent,
        player: player,
        roomNumber: roomNumber,
      };
      roomState.setRoom(room);
      setWaiting(false);
      setOpponent(room.opponent);
    }
  );

  return (
    <main>
      <h1>welcome to the room {roomState.room.player.username} </h1>
      <section>
        <div>Turn: {turn}</div>
        <div style={(side == "b")? {fontWeight: "bold"} : {}}>Opponent</div>
        <Board board={board} setMove={setMove}/>
        <div style={(side == "r")? {fontWeight: "bold"} : {}}>You</div>
      </section>
      {waiting
        ? <Waiting roomState={roomState} />
        : <Ready player={player} opponent={opponent as User} socket={socket} roomState={roomState} />}
      <button onClick={handleLeaveRoom}> leave Room</button>
    </main>
  );
};

function Waiting({roomState}: {roomState: RoomState}) {
  return (
    <section>
      <h1>Waiting for the other player to connect</h1>
      <h1>Use this number to connect: {roomState.room.roomNumber}</h1>
    </section>
  )
}

function Ready({player, opponent, socket, roomState} : {
  player: User, opponent: User, socket: Socket, roomState: RoomState
}) {
  return (
    <section>
      <h1>Other player has connected</h1>
      <h1>Your Opponent: {opponent.username}</h1>
      <Chat
        user={player}
        opponent={opponent}
        socket={socket}
        room={roomState.room}
      />
      <button>Ready</button>
    </section>
  )
}

export default GameRoom;
