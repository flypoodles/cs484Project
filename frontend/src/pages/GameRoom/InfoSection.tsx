import { Socket } from "socket.io-client";
import { User } from "../../type";
import { RoomState } from "../GameRoom";
import { useNavigate } from "react-router-dom";
import Chat from "./Chat";

import "./styles/InfoSection.css"

export default function InfoSection({
  turn,
  yourTurn,
  waiting,
  gameStatus,
  error,
  isCheck,
  roomState,
  player,
  playerReady,
  setPlayerReady,
  opponent,
  socket
} : {
  turn: number,
  yourTurn: boolean,
  waiting: boolean,
  gameStatus: boolean,
  error: string,
  isCheck: boolean,
  roomState: RoomState,
  player: User;
  playerReady: boolean; 
  setPlayerReady: React.Dispatch<React.SetStateAction<boolean>>;
  opponent: User | null;
  socket: Socket;
}) {

  const navigate = useNavigate()

  const handleClickReady = () => {
    console.log("player ready");
    setPlayerReady(true);
    socket.emit("ready");
  };
  const handleLeaveRoom = () => {
    socket.emit("leave room");
    navigate("/Lobby")
  };

  return (
    <>
      <section className="right-panel-info">
        {(waiting)? (
          <>
            <h1>Welcome to the room {roomState.room.player.username} </h1>
            <h1>Waiting for the other player to connect</h1>
            <h1>Use this number to connect: {roomState.room.roomNumber}</h1>
          </>
        ) : (
          <>
            <h1>Turn: {turn}</h1>
            {!gameStatus && <h1>Other player has connected</h1>}
            <h1>Your Opponent: {opponent?.username}</h1>
            {(error !== "") && <h1 style={{color: "red"}}>Error: {error}</h1>}
            {(isCheck && gameStatus) && <h1 style={{color: "red"}}>Checked!</h1>}
          </>
        )}
      </section>
      <section style={{marginBottom: "10px"}}>
        <button className="ready-btn" onClick={handleClickReady} disabled={playerReady || waiting}>
          Ready
        </button>
        <button className="leave-room-btn"
            onClick={handleLeaveRoom}
          > Leave Room</button>
      </section>
      <Chat
        user={player}
        opponent={opponent}
        socket={socket}
        room={roomState.room}
      />
    </>
  )
}