import React, { useEffect, useState } from "react";
import "./App.css";
import { User, RoomInfo } from "./type.ts";
import { socket } from "./socket/socket.ts";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lobby from "./components/Lobby.tsx";
import GameRoom from "./components/GameRoom.tsx";
import Welcome from "./components/Welcome.tsx";
function App() {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [getUserName, setUserName] = useState<string>("");
  const [getUser, setUser] = useState<User | null>(null);
  const [getMessage, setMessage] = useState<string>("hello world");
  const [getRoom, setRoom] = useState<RoomInfo | null>(null);

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
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Welcome
                userNameState={{ getUserName, setUserName }}
                socket={socket}
              />
            }
          ></Route>

          <Route
            path="/Lobby"
            element={<Lobby socket={socket} setRoom={setRoom} user={getUser} />}
          ></Route>
          <Route
            path="/GameRoom"
            element={
              <GameRoom
                socket={socket}
                roomState={{ room: getRoom, setRoom }}
                userState={{ user: getUser, setUser }}
              />
            }
          ></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
