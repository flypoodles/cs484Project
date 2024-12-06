// import { useNavigate } from "react-router-dom";
import "./styles/NavBar.css";
import { useState } from "react";
import { Socket } from "socket.io-client";
import { AuthContextType, useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function NavBar({ socket }: { socket: Socket }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate()
  const { logout, profile } = useAuth() as AuthContextType;

  const handleClickLogo = () => {
    socket.emit("leave room");
    navigate("/Lobby");
  };

  const handleSignout = async () => {
    try {
      setLoading(true);
      await logout();
      socket.emit("sign-out");
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  return (
    <nav className="navbar">
      <div onClick={handleClickLogo} className="navbar-left">
        Chinese Chess
      </div>
      <div className="navbar-right">
        <div className="navbar-profile">{profile?.username || ""}</div>
        <button
          disabled={loading}
          onClick={handleSignout}
          className="navbar-signout"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
