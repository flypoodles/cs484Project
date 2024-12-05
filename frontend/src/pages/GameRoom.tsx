import { User, RoomInfo } from "../type.ts";
import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

import "./styles/GameRoom.css";
import NavBar from "../components/NavBar.tsx";
import InfoSection from "./GameRoom/InfoSection.tsx";
import BoardSection from "./GameRoom/BoardSection.tsx";

export interface RoomState {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userState,
}: roomProp) => {
  // const [player, setPlayer] = useState<User>((roomState.room as RoomInfo).player);
  const player = roomState.room.player;
  const [opponent, setOpponent] = useState<User | null>(
    roomState.room != null ? roomState.room.opponent : null
  );
  const [playerReady, setPlayerReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [gameStatus, setGameStatus] = useState(false);
  const [board, setBoard] = useState<string[][]>([]);
  const [turn, setTurn] = useState(0)

  // waiting = true if there is no opponent, otherwise false
  const [waiting, setWaiting] = useState<boolean>(
    roomState.room.opponent == null ? true : false
  );

  useEffect(() => {
    socket.on("opponent leave", () => {
      console.log("socket event: opponent leave");
      setGameStatus(false);
      setPlayerReady(false);
      setOpponentReady(false);
      setOpponent(null)
      setWaiting(true);
    });

    socket.on(
      "User Joined",
      (opponent: User | null, player: User, roomNumber: string) => {
        const room: RoomInfo = {
          opponent: opponent,
          player: player,
          roomNumber: roomNumber,
        };
        console.log("user join");
        roomState.setRoom(room);
        setBoard([])
        setWaiting(false);
        setOpponent(room.opponent);
      }
    );

    socket.on("opponent ready", () => {
      console.log("opponent is ready");
      setOpponentReady(true);
    });

    return () => {
      console.log("remove eventlistener 'user join', 'opponent ready'");
      socket.removeAllListeners("User Joined");
      socket.removeAllListeners("opponent ready");
    };
  }, [socket, roomState]);

  return (
    <main id="GameRoom">
      <NavBar socket={socket} />
      <section id="leftPanel">
        <BoardSection
          setTurn={setTurn}
          board={board}
          setBoard={setBoard}
          socket={socket}
          player={player}
          playerReady={playerReady}
          opponent={opponent}
          opponentReady={opponentReady}
          gameStatus={gameStatus}
          setGameStatus={setGameStatus}
        />
      </section>
      <section id="rightPanel">
        <InfoSection 
          turn={turn}
          waiting={waiting}
          roomState={roomState}
          player={player}
          playerReady={playerReady}
          setPlayerReady={setPlayerReady}
          opponent={opponent}
          socket={socket}
        />
      </section>
    </main>
  );
};



export default GameRoom;
