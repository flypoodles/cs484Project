import { User, RoomInfo } from "../type.ts";
import React, { ReactNode, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import Chat from "../components/Chat.tsx";
import { useNavigate } from "react-router-dom";
import { loadBoard } from "../utils/utils.ts";

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
  const [playerReady, setPlayerReady] = useState(false)
  const [opponentReady, setOpponentReady] = useState(false)
  const [board, setBoard] = useState<string[][]>([])
  const [side, setSide] = useState<string>("")
  const [turn, setTurn] = useState(0)
  const [yourTurn, setYourTurn] = useState(false)
  const [move, setMove] = useState<Move | null>(null)

  // waiting = true if there is no opponent, otherwise false
  const [waiting, setWaiting] = useState<boolean>(
    roomState.room.opponent == null ? true : false
  );

  const handleLeaveRoom = () => {
    socket.emit("leave room");
  };

  socket.on("User Joined", (opponent: User | null, player: User, roomNumber: string) => {
    const room: RoomInfo = {
      opponent: opponent,
      player: player,
      roomNumber: roomNumber,
    };
    roomState.setRoom(room);
    setWaiting(false);
    setOpponent(room.opponent);
  });

  socket.on("opponent ready", () => {
    console.log("opponent is ready")
    setOpponentReady(true)
  })

  socket.on("start", (yourTurn: boolean, turn: number, side: string, boardString: string) => {
    console.log(`Start the game! yourTurn=${yourTurn} turn=${turn} side=${side} boardString=${boardString}`)
    setTurn(turn)
    setSide(side)
    setYourTurn(yourTurn)
    // populate the board and start the game
    const startBoard = loadBoard(boardString).board
    setBoard(startBoard)
  })

  return (
    <main>
      <section>
        <div>Turn: {turn}</div>
        <div style={(side == "b")? {fontWeight: "bold"} : {}}>Opponent: {opponent?.username} {opponentReady? "(ready)" : ""} </div>
        <Board board={board} setMove={setMove}/>
        <div style={(side == "r")? {fontWeight: "bold"} : {}}>You: {player.username} {playerReady? "(ready)" : ""}</div>
      </section>
      {waiting
        ? <Waiting roomState={roomState} />
        : <Ready player={player} opponent={opponent as User} socket={socket} roomState={roomState} setPlayerReady={setPlayerReady}/>}
      <button onClick={handleLeaveRoom}> leave Room</button>
    </main>
  );
};

function Waiting({roomState}: {roomState: RoomState}) {
  return (
    <section>
      <h1>welcome to the room {roomState.room.player.username} </h1>
      <h1>Waiting for the other player to connect</h1>
      <h1>Use this number to connect: {roomState.room.roomNumber}</h1>
    </section>
  )
}

function Ready({player, opponent, socket, roomState, setPlayerReady} : {
  player: User, opponent: User, socket: Socket, roomState: RoomState
}) {

  const handleClickReady = () => {
    console.log("player ready")
    setPlayerReady(true)
    socket.emit("ready")
  }

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
      <button onClick={handleClickReady}>Ready</button>
    </section>
  )
}

export default GameRoom;
