import { useEffect, useState } from "react";
import "./App.css";

import { socket } from "./socket/socket.ts";

function App() {
  const [isConnected, setIsConnected] = useState<Boolean>(socket.connected);
  const [getMessage, setMessage] = useState<String>("hello world");

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

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  console.log("isconnected:", isConnected);
  return (
    <>
      <button
        onClick={() => {
          socket.connect();
        }}
      >
        Connect
      </button>
      <button
        onClick={() => {
          socket.disconnect();
        }}
      >
        Disconnect
      </button>
      <h1>{getMessage}</h1>
      {isConnected ? <h2>true</h2> : <h2>false</h2>}
    </>
  );
}

export default App;
