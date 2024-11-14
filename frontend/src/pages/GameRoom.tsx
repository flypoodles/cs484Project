import { User, RoomInfo } from "../type.ts";
import React, { useEffect, useState  } from "react";
import { Socket } from "socket.io-client";

import Chat from "../components/Chat.tsx";
import BoardSection from "../components/BoardSection.tsx";

import "./styles/GameRoom.css"

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userState,
}: roomProp) => {

  // const navigate = useNavigate();
  // const [player, setPlayer] = useState<User>((roomState.room as RoomInfo).player);
  const player = roomState.room.player
  const [opponent, setOpponent] = useState<User | null>(roomState.room != null ? roomState.room.opponent : null);
  const [playerReady, setPlayerReady] = useState(false)
  const [opponentReady, setOpponentReady] = useState(false)
  const [gameStatus, setGameStatus] = useState(false)

  // waiting = true if there is no opponent, otherwise false
  const [waiting, setWaiting] = useState<boolean>(
    roomState.room.opponent == null ? true : false
  );

  const handleLeaveRoom = () => {
    socket.emit("leave room");
  };

  useEffect(() => {
    socket.on("opponent leave", () => {
      console.log("socket event: opponent leave")
      setGameStatus(false)
      setPlayerReady(false)
      setOpponentReady(false)
      setWaiting(true)
    })

    socket.on("User Joined", (opponent: User | null, player: User, roomNumber: string) => {
      const room: RoomInfo = {
        opponent: opponent,
        player: player,
        roomNumber: roomNumber,
      };
      console.log("user join")
      roomState.setRoom(room);
      setWaiting(false);
      setOpponent(room.opponent);
    });

    socket.on("opponent ready", () => {
      console.log("opponent is ready")
      setOpponentReady(true)
    })

    return () => {
      console.log("remove eventlistener 'user join', 'opponent ready'")
      socket.off("User Joined")
      socket.off("opponent ready")
    }
  },[socket, roomState])


  return (
    <main id="GameRoom">
      <section id="leftPanel">
        <BoardSection
          socket={socket}
          player={player} playerReady={playerReady}
          opponent={opponent} opponentReady={opponentReady}
          gameStatus={gameStatus} setGameStatus={setGameStatus}
        />
      </section>
      <section id="rightPanel">
        {waiting
          ? <Waiting
              roomState={roomState} 
            />
          : <Ready 
              player={player} setPlayerReady={setPlayerReady}
              opponent={opponent as User}
              socket={socket}
              roomState={roomState}
              gameStatus={gameStatus}
            />
        }
        <button onClick={handleLeaveRoom}> leave Room</button>
      </section>
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

function Ready({player, opponent, socket, roomState, setPlayerReady, gameStatus} : {
  player: User, setPlayerReady: React.Dispatch<React.SetStateAction<boolean>>
  opponent: User,
  socket: Socket,
  roomState: RoomState,
  gameStatus: boolean
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
      <button onClick={handleClickReady} disabled={gameStatus}>Ready</button>
    </section>
  )
}

export default GameRoom;
