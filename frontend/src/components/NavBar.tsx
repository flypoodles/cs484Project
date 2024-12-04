// import { useNavigate } from "react-router-dom";
import "./styles/NavBar.css"
import { useState } from "react";
import { Socket } from "socket.io-client";
import { AuthContextType, useAuth } from "../contexts/AuthContext";

export default function NavBar({socket}: {
  socket: Socket
}) {

  const [loading, setLoading] = useState(false)
  // const navigate = useNavigate()
  const { logout, profile } = useAuth() as AuthContextType

  const handleSignout = async () => {
    try {
      setLoading(true)
      await logout()
      socket.disconnect()
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        Chinese Chess
      </div>
      <div className="navbar-right">
        <button disabled={loading} className="navbar-profile">{profile?.username || ""}</button>
        <button disabled={loading} onClick={handleSignout} className="navbar-signout">
          Sign out
        </button>
      </div>
    </nav>
  )
}