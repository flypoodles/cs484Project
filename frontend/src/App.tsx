import React, { useEffect, useState } from "react";
import "./App.css";
import { User, RoomInfo } from "./type.ts";
import { socket } from "./socket/socket.ts";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Lobby from "./pages/Lobby.tsx";
import GameRoom from "./pages/GameRoom.tsx";
import Welcome from "./pages/Welcome.tsx";
import { User as AuthUser } from "firebase/auth"
import { useAuth } from "./contexts/AuthContext.tsx";

function App() {
  // const [userName, setUserName] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const navigate = useNavigate();

  const { currentUser } = useAuth() as { currentUser: AuthUser | null }

  useEffect(() => {

    if (!socket.connected && currentUser) {
      socket.auth = { username: currentUser.email };
      socket.connect()
    }

    // socket will call this function if connected
    function onConnect(user: User) {
      setUser(user);
      navigate("/Lobby");
    }

    // socket will call this function if disconnected
    function onDisconnect() {
      setRoom(null);
      setUser(null);
      navigate("/");
    }

    socket.on("onConnect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("onConnect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

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
          element={(!currentUser)? <Welcome socket={socket}/> : <Navigate to="/Lobby" />}
        />
        <Route
          path="/Lobby"
          element={(currentUser)? <Lobby socket={socket} setRoom={setRoom} user={user} /> : <Navigate to="/" />}
        />
        <Route
          path="/GameRoom"
          element={
            <GameRoom
              socket={socket}
              roomState={
                { room: room, setRoom } as {
                  room: RoomInfo;
                  setRoom: React.Dispatch<React.SetStateAction<RoomInfo>>;
                }
              }
              userState={{ user: user, setUser }}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
