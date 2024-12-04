import { User, RoomInfo } from "../type.ts";
import React, {  useState } from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";

import "./styles/Lobby.css"
import { useAuth } from "../contexts/AuthContext.tsx";

interface LobbyProp {
  user: User | null;
  socket: Socket;
  setRoom: React.Dispatch<React.SetStateAction<RoomInfo | null>>;
}
const Lobby: React.FC<LobbyProp> = ({ socket, setRoom, user }: LobbyProp) => {
  const [joinScreen, setJoinScreen] = useState<boolean>(false);

  const [roomNumber, setRoomNumber] = useState<string>("");
  const [joinError, setJoinError] = useState<boolean>(false);
  const [getError, setError] = useState<string>("");

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();

  const { logout } = useAuth() as { logout: () => Promise<void> }

  const handleCreate = () => {
    socket.emit("createRoom");

    socket.on(
      "newRoom",
      (opponent: User | null, player: User, roomNumber: string) => {
        console.log("you have joined Room : ", roomNumber);

        const room: RoomInfo = {
          opponent: opponent,
          player: player,
          roomNumber: roomNumber,
        };
        console.log(room);
        setRoom(room);

        // redirect to gameroom
        console.log("navagating");
        navigate("/GameRoom");
      }
    );

    console.log("creating a room");
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    socket.emit("Join Room Request", roomNumber);

    // if the user tried to join a room, the user socket will receive this.
    socket.on(
      "Joined",
      (opponent: User | null, player: User, roomNumber: string) => {
        const room: RoomInfo = {
          opponent: opponent,
          player: player,
          roomNumber: roomNumber,
        };
        setRoom(room);

        // redirect to gameroom
        navigate("/GameRoom");
      }
    );

    socket.on("Join Error", (err: string) => {
      setJoinError(true);
      setError(err);
    });
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true)
      await logout()
      socket.disconnect()
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  return (
    <section id="lobby">
      <div className="lobby-content">
        <button disabled={loading} className="disconnectBtn" onClick={handleDisconnect}>Disconnect</button>

        {/* make sure that the user is not null as this point */}
        {user == null ? (
          <h1>Loading Lobby...</h1>
        ) : (
          <h1>Welcome {user.username}!</h1>
        )}

        {joinError && <h1> Join error: {getError}</h1>}
        {joinScreen ? (
          <>
            <form className="form-joinRoom" onSubmit={handleJoin}>
              <input
                type="text"
                value={roomNumber}
                placeholder="Enter room number"
                onChange={(e) => setRoomNumber(e.target.value)}
                required
              />

              <button type="button" onClick={() => setJoinScreen(false)}>Back</button>
              <button type="submit">Join</button>
            </form>
          </>
        ) : (
          <div className="lobby-options">
            <button onClick={() => handleCreate()}>Create</button>
            <button onClick={() => setJoinScreen(true)}>Join a room</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Lobby;
