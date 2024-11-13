import React, { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";

import "./styles/Welcome.css"
// I am wrapping all state variables in an interface, so it is clear to see which function belongs to which state.
// state username state.
interface UserNameState {
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
}

// prop interface
interface Props {
  // Define your component's props here
  userNameState: UserNameState;
  socket: Socket;
}

const Welcome: FC<Props> = ({ userNameState, socket }) => {
  const navigate = useNavigate();
  const handleConnection = (e: React.FormEvent) => {
    // after the user has typed in a username, the socket will establish connection with the server.
    e.preventDefault();
    socket.auth = { username: userNameState.userName };
    socket.connect();
    // redirect route to the lobby
    navigate("/Lobby");
  };
  return (
    <div id="welcome">
      <form className="loginForm" onSubmit={handleConnection}>
        <h1>Welcome to Chess game!</h1>
        <h3>Login</h3>
        <input
          type="text"
          value={userNameState.userName}
          placeholder="Enter userName"
          onChange={(e) => userNameState.setUserName(e.target.value)}
          required
        />
        <button type="submit">Connect</button>
      </form>
    </div>
  );
};

export default Welcome;
