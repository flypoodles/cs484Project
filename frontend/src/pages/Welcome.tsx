import React, { FC, useState } from "react";
import { Socket } from "socket.io-client";

import "./styles/Welcome.css";
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
  const [isLoading, setLoading] = useState<boolean>(false);
  const handleConnection = (e: React.FormEvent) => {
    // after the user has typed in a username, the socket will establish connection with the server.
    e.preventDefault();
    socket.auth = { username: userNameState.userName };
    socket.connect();
    setLoading(true);
    // redirect route to the lobby
  };
  return (
    <div id="welcome">
      {isLoading ? (
        <Loading />
      ) : (
        <EnterInfo
          handleConnection={handleConnection}
          userNameState={userNameState}
        />
      )}
    </div>
  );
};

function EnterInfo({
  handleConnection,
  userNameState,
}: {
  handleConnection: (e: React.FormEvent) => void;
  userNameState: UserNameState;
}) {
  return (
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
  );
}
function Loading() {
  return (
    <section>
      <h1>Waiting for the server to load</h1>
    </section>
  );
}

export default Welcome;
