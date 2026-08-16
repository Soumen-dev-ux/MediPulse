import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const appointmentsRef = collection(db, "appointments");

// Create a new appointment
export const createAppointment = async (data) => {
  const newAppointment = {
    ...data,
    status: data.status || "confirmed",
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(appointmentsRef, newAppointment);
  return { id: docRef.id, ...newAppointment };
};

// Listen to user's appointments in real time
export const subscribeUserAppointments = (userId, callback) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  const q = query(
    appointmentsRef,
    where("userId", "==", userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(appointments);
    },
    (error) => {
      console.error("Error subscribing to appointments:", error);
      callback([]);
    }
  );
};

// Listen to all appointments for doctors/admins
export const subscribeAllAppointments = (callback) => {
  return onSnapshot(
    appointmentsRef,
    (snapshot) => {
      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(appointments);
    },
    (error) => {
      console.error("Error subscribing to all appointments:", error);
      callback([]);
    }
  );
};

// Cancel an appointment
export const cancelAppointment = async (appointmentId) => {
  const docRef = doc(db, "appointments", appointmentId);
  await updateDoc(docRef, {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
};
