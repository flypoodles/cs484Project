import React, { FC, useState } from "react";
import { Socket } from "socket.io-client";
import { auth, provider } from "../firebase/firebase"
import "./styles/Welcome.css";
import { signInWithPopup, UserCredential } from "firebase/auth";
// import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// I am wrapping all state variables in an interface, so it is clear to see which function belongs to which state.
// state username state.

// prop interface
interface Props {
  // Define your component's props here
  socket: Socket;
}

const Welcome: FC<Props> = ({ socket }) => {
  // const navigate = useNavigate()
  const [isLoading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")

  const { login } = useAuth() as { login: (email: string, password: string) => Promise<UserCredential> }

  const handleConnection = (e: React.FormEvent) => {
    // after the user has typed in a username, the socket will establish connection with the server.
    e.preventDefault();
    login(username, password).then((result) => {
      console.log(result)
      socket.auth = { username: username };
      socket.connect();
      setLoading(true);
      // redirect route to the lobby
    })
  };

  const handleSignInGoogle = () => {
    signInWithPopup(auth, provider).then((result) => {
      console.log(result)
      const user = result.user
      if (user) {
        socket.auth = { username: user.email }
        socket.connect()
        setLoading(true)
      }
    })
  }

  return (
    <div id="welcome">
      {isLoading ? (
        <Loading />
      ) : (
        <EnterInfo
          handleConnection={handleConnection}
          handleSignInGoogle={handleSignInGoogle}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
        />
      )}
    </div>
  );
};

function EnterInfo({
  handleConnection,
  handleSignInGoogle,
  username,
  setUsername,
  password,
  setPassword,
}: {
  handleConnection: (e: React.FormEvent) => void,
  handleSignInGoogle: () => void,
  username: string,
  setUsername: React.Dispatch<React.SetStateAction<string>>,
  password: string,
  setPassword: React.Dispatch<React.SetStateAction<string>>
}) {

  return (
    <>
      <form className="loginForm" onSubmit={handleConnection}>
        <h1>Welcome to Chess game!</h1>
        <h3>Login</h3>
        <label>Username / Gmail</label>
        <input
          type="text"
          value={username}
          placeholder="Enter username"
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />
        <button type="submit">Connect</button>
      </form>
      <div>-- Or sign in with --</div>
      <button type="button" onClick={handleSignInGoogle} >Google</button>
    </>
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
