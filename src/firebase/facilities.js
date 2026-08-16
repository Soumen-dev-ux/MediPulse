import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./config";

const facilityRef = doc(
  db,
  "facilities",
  "city-central"
);

const defaultFacility = {
  name: "City Central Hospital",
  address: "Block B, Floor 3, Park Street, Main Campus",
  latitude: 22.5726,
  longitude: 88.3639,
  currentToken: 1,
  lastToken: 1,
  isDoctorPresent: true,
};

// Get facility once
export const getFacility = async () => {
  const snapshot = await getDoc(facilityRef);

  if (!snapshot.exists()) {
    await setDoc(facilityRef, { ...defaultFacility, createdAt: serverTimestamp() });
    return { id: "city-central", ...defaultFacility };
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

// Listen to facility in real time (auto-create if missing)
export const subscribeToFacility = (callback) => {
  return onSnapshot(
    facilityRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: snapshot.id,
          ...snapshot.data(),
        });
      } else {
        try {
          await setDoc(facilityRef, { ...defaultFacility, createdAt: serverTimestamp() });
        } catch (e) {
          console.error("Failed to auto-create facility document:", e);
        }
        callback({
          id: "city-central",
          ...defaultFacility,
        });
      }
    },
    (error) => {
      console.error("Facility snapshot listener error:", error);
      callback({
        id: "city-central",
        ...defaultFacility,
      });
    }
  );
};

// Doctor present / away
export const updateDoctorPresence = async (
  isDoctorPresent,
  doctorId,
  doctorName
) => {
  await setDoc(
    facilityRef,
    {
      isDoctorPresent,
      currentDoctorId: doctorId,
      currentDoctorName: doctorName,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// Serve next patient
export const serveNextPatient = async () => {
  await setDoc(
    facilityRef,
    {
      currentToken: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// Generate new patient token
export const generateQueueToken = async () => {
  await setDoc(
    facilityRef,
    {
      lastToken: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  const snapshot = await getDoc(facilityRef);

  return snapshot.data()?.lastToken || 1;
};

// Reset queue token
export const resetQueueToken = async () => {
  await setDoc(
    facilityRef,
    {
      currentToken: 1,
      lastToken: 1,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};