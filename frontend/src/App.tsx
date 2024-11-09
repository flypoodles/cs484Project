import React, { useEffect, useState } from "react";
import "./App.css";
import { User, RoomInfo } from "./type.ts";
import { socket } from "./socket/socket.ts";
import { Routes, Route, useNavigate } from "react-router-dom";
import Lobby from "./pages/Lobby.tsx";
import GameRoom from "./pages/GameRoom.tsx";
import Welcome from "./pages/Welcome.tsx";
function App() {
  const [userName, setUserName] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    // socket will call this function if connected
    function onConnect(user: User) {
      setUser(user);
    }

    // socket will call this function if disconnected
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
              userNameState={{ userName, setUserName }}
              socket={socket}
            />
          }
        ></Route>

        <Route
          path="/Lobby"
          element={<Lobby socket={socket} setRoom={setRoom} user={user} />}
        ></Route>
        <Route
          path="/GameRoom"
          element={
            <GameRoom
              socket={socket}
              roomState={{ room: room, setRoom } as {room: RoomInfo, setRoom: React.Dispatch<React.SetStateAction<RoomInfo>>}}
              userState={{ user: user, setUser }}
            />
          }
        ></Route>
      </Routes>
    </>
  );
}

export default App;
