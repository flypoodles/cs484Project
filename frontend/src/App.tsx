import React, { useEffect, useState } from "react";
import "./App.css";
import { User, RoomInfo } from "./type.ts";
import { socket } from "./socket/socket.ts";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Lobby from "./components/Lobby.tsx";
import GameRoom from "./components/GameRoom.tsx";
import Welcome from "./components/Welcome.tsx";
function App() {
  const [getUserName, setUserName] = useState<string>("");
  const [getUser, setUser] = useState<User | null>(null);
  const [getRoom, setRoom] = useState<RoomInfo | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    function onConnect(user: User) {
      setUser(user);
    }

    function onDisconnect() {
      setRoom(null);
      setUser(null);
      setUserName("");
      navigate("/");
    }

    socket.on("onConnect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("onConnect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  });

  socket.on("connect_error", (err) => {
    if (err.message === "invalid username") {
      console.log("error: " + err.message);
    }
  });

  return (
    <>
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
    </>
  );
}

export default App;
