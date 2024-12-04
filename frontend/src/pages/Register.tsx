import { FormEvent, useRef, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { UserCredential } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { Link, useNavigate } from "react-router-dom"

import "./styles/Register.css"
import { Socket } from "socket.io-client"

export default function Register({ socket } : {
  socket: Socket
}) {

  const emailRef = useRef<HTMLInputElement>(null)
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const { register } = useAuth() as { register: (email: string, password: string) => Promise<UserCredential> }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const email = emailRef.current?.value as string
      const username = usernameRef.current?.value as string
      const password = passwordRef.current?.value as string
      const confirmPassword = confirmPasswordRef.current?.value as string

      if (password !== confirmPassword) {
        setError("Password don't match")
        setLoading(false)
        return
      }

      const { user } = await register(email, password)
      await setDoc(doc(db, "Users", user.uid), {
        email: email,
        username: username,
        photo: "",
      })
      console.log(`add user ${email} to firestore. Now connect to socket`)
      socket.auth = { username: username };
      socket.connect();
      navigate("/Lobby")

    } catch (err) {
      console.error(err)
      setError("Failed to register: It seems like there is already an account with that email")
    }
    setLoading(false)
  }

  return (
    <div id="Register">
      <h1>Registration</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input 
          ref={emailRef}
          className="register-email" type="email" placeholder="Enter your email" required 
        />
        <label style={{marginBottom: 0}}>Username</label>
        <div style={{marginBottom: "5px"}}>(This will be your name that other players can view)</div>
        <input 
          ref={usernameRef}
          className="register-username" type="text" placeholder="Enter your username" required 
        />
        <label>Password</label>
        <input
          ref={passwordRef}
          className="password" type="password" placeholder="Enter your password" 
        />
        <label>Confirm password</label>
        <input 
          ref={confirmPasswordRef}
          className="password" type="password" placeholder="Enter your confirm password" 
        />
        {error && <div className="register-error">Error: {error}</div>}
        <button className="register-btn" disabled={loading} type="submit">Register</button>
      </form>
      <div style={{marginTop: "10px"}}>
        Already have an account? Click <Link to="/">here</Link> to login
      </div>
    </div>
  )
}