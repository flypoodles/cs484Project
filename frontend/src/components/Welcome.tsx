import React, { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";

// I am wrapping all state variables in an interface, so it is clear to see which function belongs to which state.
// state username state.
interface UserNameState {
  getUserName: string;
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
    e.preventDefault();
    socket.auth = { username: userNameState.getUserName };
    socket.connect();
    // redirect route to the lobby
    navigate("/Lobby");
  };
  return (
    <div>
      <form onSubmit={handleConnection}>
        <label htmlFor="productId"></label>
        <input
          type="text"
          value={userNameState.getUserName}
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
