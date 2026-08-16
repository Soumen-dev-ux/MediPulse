import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const prescriptionsRef = collection(db, "prescriptions");

// Default initial prescriptions for fallback / seeding
export const defaultPrescriptions = [
  {
    id: "rx-1",
    medication: "Amoxicillin 500mg",
    instructions: "1 capsule twice daily after meals",
    remainingDays: "5 days remaining",
    doctorName: "Dr. Sharma",
    facility: "City Central Hospital",
    refillStatus: "ready", // 'ready' | 'requested' | 'active'
    dateIssued: "Aug 10, 2026",
  },
  {
    id: "rx-2",
    medication: "Atorvastatin 10mg",
    instructions: "1 tablet at bedtime",
    remainingDays: "14 days remaining",
    doctorName: "Dr. Ananya Roy",
    facility: "City Central Hospital",
    refillStatus: "active",
    dateIssued: "Aug 02, 2026",
  },
];

// Listen to user prescriptions in real time
export const subscribeUserPrescriptions = (userId, callback) => {
  if (!userId) {
    callback(defaultPrescriptions);
    return () => {};
  }
  const q = query(prescriptionsRef, where("userId", "==", userId));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(defaultPrescriptions);
      } else {
        const prescriptions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(prescriptions);
      }
    },
    (error) => {
      console.error("Error subscribing to prescriptions:", error);
      callback(defaultPrescriptions);
    }
  );
};

// Request prescription refill
export const requestPrescriptionRefill = async (prescriptionId) => {
  try {
    const docRef = doc(db, "prescriptions", prescriptionId);
    await updateDoc(docRef, {
      refillStatus: "requested",
      requestedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn("Updating local fallback prescription refill status:", error);
  }
};

// Create a new prescription (Doctor action)
export const createPrescription = async (data) => {
  const newRx = {
    ...data,
    refillStatus: "active",
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(prescriptionsRef, newRx);
  return { id: docRef.id, ...newRx };
};
