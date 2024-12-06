import React, { useEffect, useState } from "react";
import "./App.css";
import { User, RoomInfo } from "./type.ts";
import { socket } from "./socket/socket.ts";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Lobby from "./pages/Lobby.tsx";
import GameRoom from "./pages/GameRoom.tsx";
import Welcome from "./pages/Welcome.tsx";
// import { User as AuthUser } from "firebase/auth";
import { useAuth, AuthContextType } from "./contexts/AuthContext.tsx";
import Register from "./pages/Register.tsx";

function App() {
  // const [userName, setUserName] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const navigate = useNavigate();

  const { currentUser, logout } = useAuth() as AuthContextType;

  useEffect(() => {

    // socket will call this function if connected
    function onConnect(user: User) {
      setUser(user);
      navigate("/Lobby");
    }

    // socket will call this function if disconnected
    async function onDisconnect() {
      setRoom(null);
      setUser(null);

      await logout();
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
      console.error(err);
    }
  });

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            !currentUser ? ( // if user is not authenticated then direct them to Welcome page to login, otherwise redirect them to lobby
              <Welcome socket={socket} />
            ) : (
              <Navigate to="/Lobby" />
            )
          }
        />
        <Route
          path="/Lobby"
          element={
            currentUser ? ( // only allow user to enter this path if user is authenticated
              <Lobby socket={socket} setRoom={setRoom} user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/Register" element={<Register socket={socket} />} />
        <Route
          path="/GameRoom"
          element={
            currentUser && room ? ( // only allow user to enter this path if user is authenticated and user created a room
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
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
