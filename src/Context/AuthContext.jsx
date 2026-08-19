import {
  useEffect,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase/config";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          setLoading(true);

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
            setUserData({
              id: userSnapshot.id,
              ...userSnapshot.data(),
            });
          } else {
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

            setUserData({
              id: firebaseUser.uid,
              ...newUser,
            });
          }
        } catch (error) {
          console.error("Auth context error:", error);
          setUserData(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  const value = {
    user,
    userData,
    role: userData?.role || null,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
