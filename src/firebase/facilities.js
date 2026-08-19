import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  collection,
  addDoc,
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
  status: "Operational",
  departments: ["Cardiology", "General Medicine", "Pediatrics", "OPD", "Emergency"]
};

// Get facility once
export const getFacility = async (facilityId = "city-central") => {
  const ref = doc(db, "facilities", facilityId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    await setDoc(ref, { ...defaultFacility, createdAt: serverTimestamp() });
    return { id: facilityId, ...defaultFacility };
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

// Listen to facility in real time (auto-create if missing)
export const subscribeToFacility = (callback, facilityId = "city-central") => {
  try {
    const ref = doc(db, "facilities", facilityId);
    return onSnapshot(
      ref,
      async (snapshot) => {
        if (snapshot.exists()) {
          callback({
            id: snapshot.id,
            ...snapshot.data(),
          });
        } else {
          try {
            await setDoc(ref, { ...defaultFacility, createdAt: serverTimestamp() });
          } catch (e) {
            console.error("Failed to auto-create facility document:", e);
          }
          callback({
            id: facilityId,
            ...defaultFacility,
          });
        }
      },
      (error) => {
        console.error("Facility snapshot listener error:", error);
        callback({
          id: facilityId,
          ...defaultFacility,
        });
      }
    );
  } catch (err) {
    console.error("subscribeToFacility failed:", err);
    callback({
      id: facilityId,
      ...defaultFacility,
    });
    return () => {};
  }
};

// Doctor present / away
export const updateDoctorPresence = async (
  isDoctorPresent,
  doctorId,
  doctorName,
  facilityId = "city-central"
) => {
  const ref = doc(db, "facilities", facilityId);
  await setDoc(
    ref,
    {
      isDoctorPresent,
      currentDoctorId: doctorId,
      currentDoctorName: doctorName,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// Serve next patient token
export const serveNextPatient = async (facilityId = "city-central", deptKey = "currentToken") => {
  const ref = doc(db, "facilities", facilityId);
  await setDoc(
    ref,
    {
      [deptKey]: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// Generate new patient token & record issued walk-in token
export const generateQueueToken = async (facilityId = "city-central", patientPhone = "", patientName = "Walk-in Patient", department = "Cardiology") => {
  const ref = doc(db, "facilities", facilityId);
  await setDoc(
    ref,
    {
      lastToken: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  const snapshot = await getDoc(ref);
  const tokenNumber = snapshot.data()?.lastToken || 1;

  // Add issued walk-in token to sub-collection for audit
  try {
    const tokensCol = collection(db, "facilities", facilityId, "issued_tokens");
    await addDoc(tokensCol, {
      tokenNumber,
      tokenCode: `#A-${tokenNumber}`,
      patientPhone,
      patientName: patientName || "Walk-in / Phone",
      department,
      status: "Waiting",
      issuedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Walk-in token record save error:", err);
  }

  return tokenNumber;
};

// Reset queue token
export const resetQueueToken = async (facilityId = "city-central") => {
  const ref = doc(db, "facilities", facilityId);
  await setDoc(
    ref,
    {
      currentToken: 1,
      lastToken: 1,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// Subscribe to issued tokens for a facility
export const subscribeIssuedTokens = (callback, facilityId = "city-central") => {
  try {
    const tokensCol = collection(db, "facilities", facilityId, "issued_tokens");
    return onSnapshot(
      tokensCol,
      (snapshot) => {
        const tokens = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort newest first
        tokens.sort((a, b) => new Date(b.issuedAt || 0) - new Date(a.issuedAt || 0));
        callback(tokens);
      },
      (error) => {
        console.warn("Issued tokens subscription failed:", error);
        callback([]);
      }
    );
  } catch (err) {
    console.error("subscribeIssuedTokens failed:", err);
    callback([]);
    return () => {};
  }
};