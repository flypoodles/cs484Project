import React, { useEffect, useState } from "react";
import "./App.css";
import { User } from "./type.ts";
import { socket } from "./socket/socket.ts";
import UserList from "./components/userList.tsx";
function App() {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [getUserName, setUserName] = useState<string>("");
  const [getMessage, setMessage] = useState<string>("hello world");
  const [getUsers, setUsers] = useState<User[]>([]);
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
      setMessage("you have diconnected");
    }

    function onMessage(message: String) {
      setMessage(message);
    }

    function onUsers(users: User[]) {
      console.log("users\n");
      setUsers(users);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    socket.on("users", onUsers);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("users", onUsers);
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
        <button
          onClick={() => {
            socket.disconnect();
          }}
        >
          Disconnect
        </button>
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

      <h1>{getMessage}</h1>
      {isConnected ? <UserList users={getUsers} /> : <h2>Not connected</h2>}
    </>
  );
}

export default App;
