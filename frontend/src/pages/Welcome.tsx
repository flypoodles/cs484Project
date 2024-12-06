import React, { FC, useState } from "react";
import { Socket } from "socket.io-client";
import { auth, db, provider } from "../firebase/firebase";
import "./styles/Welcome.css";
import GoogleIcon from "/src/icons/GoogleIcon";
import { signInWithPopup, UserCredential } from "firebase/auth";
// import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile } from "../type";
import CircularProgress from "@mui/material/CircularProgress";
// I am wrapping all state variables in an interface, so it is clear to see which function belongs to which state.
// state username state.

// prop interface
interface Props {
  socket: Socket;
}

const Welcome: FC<Props> = ({ socket }) => {
  // const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAuthenticate, setLoadingAuthenticate] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState("");

  const { login, setProfile } = useAuth() as {
    login: (email: string, password: string) => Promise<UserCredential>;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  };

  const handleConnection = (e: React.FormEvent) => {
    // after the user has typed in a username, the socket will establish connection with the server.
    e.preventDefault();
    setError("");
    setLoadingAuthenticate(true);

    login(email, password)
      .then(async (result) => {
        const docRef = doc(db, "Users", result.user.uid);
        const docSnap = await getDoc(docRef);
        const newProfile = docSnap.data() as UserProfile;
        setProfile(newProfile);
        socket.auth = {
          email: newProfile.email,
          username: newProfile.username,
          photo: newProfile.photo,
        };
        socket.connect();
        // redirect route to the lobby
        setLoading(true); // set load to wait for socket server
      })
      .catch((err) => {
        console.error(err);
        setError("Error: Login failed. Incorrect password or email");
      })
      .finally(() => {
        setLoadingAuthenticate(false);
      });
  };

  const handleSignInGoogle = () => {
    setError("");
    setLoadingAuthenticate(true);

    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;

        // look up in firestore for username. If not exist then create a new one
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const { email, username, photo } = docSnap.data() as UserProfile;
          console.log("username already exists in firestore:", username);
          setProfile({ email, username, photo });
          socket.auth = {
            email: email,
            username: username,
            photo: user.photoURL || "",
          };
        } else {
          console.log("username not in firestore. Adding to firestore");
          await setDoc(doc(db, "Users", user.uid), {
            email: user.email,
            username: user.displayName,
            photo: "",
          });
          setProfile({
            email: user.email as string,
            username: user.displayName || "",
            photo: "",
          });
          socket.auth = {
            email: email,
            username: user.displayName,
            photo: user.photoURL || "",
          };
        }
        alert("connecting");
        socket.connect();
        setLoading(true);
      })
      .catch((err) => {
        console.error(err);
        setError("Error: Login failed. Incorrect password or email");
      })
      .finally(() => {
        setLoadingAuthenticate(false);
      });
  };

  return (
    <div id="welcome">
      {loading ? (
        <Loading />
      ) : (
        <EnterInfo
          loadingAuthenticate={loadingAuthenticate}
          error={error}
          handleConnection={handleConnection}
          handleSignInGoogle={handleSignInGoogle}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />
      )}
    </div>
  );
};

function EnterInfo({
  loadingAuthenticate,
  error,
  handleConnection,
  handleSignInGoogle,
  email,
  setEmail,
  password,
  setPassword,
}: {
  loadingAuthenticate: boolean;
  error: string;
  handleConnection: (e: React.FormEvent) => void;
  handleSignInGoogle: () => void;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div id="Welcome">
      <h1>Welcome to Chess game!</h1>
      {loadingAuthenticate && (
        <CircularProgress 
          size="40px"
          thickness={5}
        />)}
      {error && <div className="login-error">Error: {error}</div>}
      <form className="loginForm" onSubmit={handleConnection}>
        <h2 style={{ marginBottom: "10px", marginTop: "0px" }}>Login</h2>
        <label>Username / Gmail</label>
        <input
          type="text"
          value={email}
          placeholder="Enter username"
          onChange={(e) => setEmail(e.target.value)}
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
        <button
          disabled={loadingAuthenticate}
          className="login-connect-btn"
          type="submit"
        >
          Connect
        </button>
      </form>
      <div style={{ marginTop: "10px" }}>
        Don't have an account? Register a new account:{" "}
        <Link to="/Register">Registration</Link>
      </div>
      <div style={{ marginTop: "5px" }}>-- Or sign in with --</div>
      <button
        disabled={loadingAuthenticate}
        className="login-google-btn"
        type="button"
        onClick={handleSignInGoogle}
      >
        <span style={{ marginRight: "10px" }}>Google</span> <GoogleIcon />
      </button>
    </div>
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
