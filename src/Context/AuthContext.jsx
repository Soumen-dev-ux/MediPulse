import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase/config";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (!firebaseUser) {
            setUser(null);
            setUserData(null);
            setLoading(false);
            return;
          }

          setUser(firebaseUser);

          const userRef = doc(
            db,
            "users",
            firebaseUser.uid
          );

          const userSnapshot = await getDoc(userRef);

          if (userSnapshot.exists()) {
            setUserData(userSnapshot.data());
          } else {
            // Create a default patient profile
            const newUser = {
              name: firebaseUser.displayName || "",
              email: firebaseUser.email || "",
              phone: firebaseUser.phoneNumber || "",
              role: "patient",
              authProvider:
                firebaseUser.providerData[0]?.providerId || "unknown",
              createdAt: serverTimestamp(),
            };

            await setDoc(userRef, newUser);

            setUserData(newUser);
          }
        } catch (error) {
          console.error("Auth context error:", error);
        } finally {
          setLoading(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}