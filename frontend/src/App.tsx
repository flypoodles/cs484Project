import React, { useEffect, useState } from "react";
import "./App.css";
import { User, RoomInfo } from "./type.ts";
import { socket } from "./socket/socket.ts";
import Lobby from "./components/Lobby.tsx";
import GameRoom from "./components/GameRoom.tsx";
function App() {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [getUserName, setUserName] = useState<string>("");
  const [getUser, setUser] = useState<User | null>(null);
  const [getMessage, setMessage] = useState<string>("hello world");
  const [getRoom, setRoom] = useState<RoomInfo | null>(null);
  const [isHost, setisHost] = useState<boolean>(false);
  useEffect(() => {
    function onConnect(user: User) {
      setIsConnected(true);
      setUser(user);
    }

    function onDisconnect() {
      setIsConnected(false);
      setMessage("you have diconnected");
      setRoom(null);
      setUser(null);
      setisHost(false);
      setUserName("");
    }

    function onMessage(message: string) {
      setMessage(message);
    }

    socket.on("onConnect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);

    return () => {
      socket.off("onConnect", onConnect);
      socket.off("disconnect", onDisconnect);

      socket.off("message", onMessage);
    };
  }, []);

  socket.on("connect_error", (err) => {
    if (err.message === "invalid username") {
      setMessage("invalid Username");
    }
  });

  const handleConnection = (e: React.FormEvent) => {
    e.preventDefault();
    socket.auth = { username: getUserName };
    socket.connect();
  };
  return (
    <>
      {isConnected ? (
        <>
          <button
            onClick={() => {
              socket.disconnect();
            }}
          >
            Disconnect
          </button>
          <h1>{getMessage}</h1>
          {getUser == null && (
            <h1> Error: User object is null while connected</h1>
          )}
          {getRoom == null ? (
            <Lobby
              user={getUser as User}
              socket={socket}
              setRoom={setRoom}
              setHost={setisHost}
            />
          ) : (
            <GameRoom
              socket={socket}
              room={getRoom}
              ishost={isHost}
              setRoom={setRoom}
            />
          )}
        </>
      ) : (
        <form onSubmit={handleConnection}>
          <label htmlFor="productId"></label>
          <input
            type="text"
            value={getUserName}
            placeholder="Enter userName"
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          <button type="submit">Connect</button>
        </form>
      )}
    </>
  );
}

export default App;
