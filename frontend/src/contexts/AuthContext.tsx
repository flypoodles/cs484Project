import { useContext, useEffect, useState, createContext } from "react";
import { auth, db } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as AuthUser,
  UserCredential,
} from "firebase/auth";
import { UserProfile } from "../type";
import { doc, getDoc, setDoc } from "firebase/firestore";
// import { socket } from "../socket/socket";

import CircularProgress from "@mui/material/CircularProgress";
import { socket } from "../socket/socket";

export interface AuthContextType {
  register: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  currentUser: AuthUser | null;
}

const AuthContext = createContext<null | AuthContextType>(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  console.log(currentUser?.email);
  console.log(profile?.username);

  const register = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    // console.log(profile)
    // console.log(currentUser)

    if (profile && currentUser && !socket.connected) {
      socket.auth = {
        email: profile.email,
        username: profile.username,
        photo: currentUser.photoURL || profile.photo,
      };
      console.log("already authenticated! now connect socket ...")
      socket.connect();
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log(user?.uid)
      setCurrentUser(user);
      if (!user) {
        setProfile(null)
        // return
      }

      // if user session still exists but profile not then go to firestore and grab username
      try {
        if (user && !profile) {
          console.log("user session still here. Loading profile");
          // look up in firestore for username. If not exist then create a new one
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const { email, username, photo } = docSnap.data() as UserProfile;
            // console.log("username already exists in firestore:", username);
            setProfile({ email, username, photo });
          } else {
            // console.log("username not in firestore. Adding to firestore");
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
          }
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);

    });

    return unsubscribe;
  }, [profile, currentUser]);

  const value = {
    register,
    login,
    logout,
    profile,
    setProfile,
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress
            size="50px"
            sx={{
              color: "black",
            }}
          />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
