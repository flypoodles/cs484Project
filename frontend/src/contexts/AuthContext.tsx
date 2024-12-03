import { useContext, useEffect, useState, createContext } from "react"
import { auth } from "../firebase/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User as AuthUser, UserCredential } from "firebase/auth"

interface AuthContextType {
  signup: (email: string, password: string) => Promise<UserCredential>,
  login: (email: string, password: string) => Promise<UserCredential>,
  logout: () => Promise<void>,
  currentUser: AuthUser | null,
}

const AuthContext = createContext<null | AuthContextType>(null)

export const useAuth = () => {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode}) {

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  console.log(currentUser)

  const signup = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = () => {
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])
  

  const value = {
    signup,
    login,
    logout,
    currentUser,
  }

  return (
    <AuthContext.Provider value={value} >
      {!loading && children}
    </AuthContext.Provider>
  )
}