import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config";

// ================================
// USER ROLE UTILITIES
// ================================

export const updateUserRole = async (uid, role, extraData = {}) => {
  await updateDoc(doc(db, "users", uid), {
    role,
    ...extraData,
    updatedAt: serverTimestamp(),
  });
};

// ================================
// DOCTOR MANAGEMENT
// ================================

export const registerDoctor = async (uid, data) => {
  await setDoc(doc(db, "doctors", uid), {
    ...data,
    isPublic: true,
    isAvailable: false,
    currentlyAtClinic: false,
    verificationStatus: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getDoctorProfile = async (uid) => {
  const snap = await getDoc(doc(db, "doctors", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getPublicDoctors = async () => {
  const q = query(
    collection(db, "doctors"),
    where("isPublic", "==", true),
    where("verificationStatus", "==", "verified")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ================================
// CLINIC / FACILITY MANAGEMENT
// ================================

export const registerClinic = async (uid, data) => {
  await setDoc(doc(db, "facilities", uid), {
    ...data,
    isPublic: true,
    verificationStatus: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getClinicProfile = async (uid) => {
  const snap = await getDoc(doc(db, "facilities", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getPublicClinics = async (withPharmacyOnly = false) => {
  let q;
  if (withPharmacyOnly) {
    q = query(
      collection(db, "facilities"),
      where("isPublic", "==", true),
      where("hasPharmacy", "==", true)
    );
  } else {
    q = query(collection(db, "facilities"), where("isPublic", "==", true));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getClinicsWithDelivery = async () => {
  const q = query(
    collection(db, "facilities"),
    where("isPublic", "==", true),
    where("hasPharmacy", "==", true),
    where("pharmacyDetails.deliveryEnabled", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ================================
// PATIENT MANAGEMENT
// ================================

export const registerPatient = async (uid, data) => {
  await setDoc(doc(db, "patients", uid), {
    ...data,
    isPublic: false, // STRICTLY PRIVATE
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getPatientProfile = async (uid) => {
  const snap = await getDoc(doc(db, "patients", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getPrivatePatientProfile = async (uid, requestorUid, requestorRole) => {
  // Only the patient themselves, assigned doctors, or admins can view
  if (requestorUid !== uid && requestorRole !== "doctor" && requestorRole !== "admin") {
    throw new Error("Access denied: insufficient permissions.");
  }
  return getPatientProfile(uid);
};

// ================================
// DISTANCE UTILITIES
// ================================

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // in km
};

export const sortByDistance = (items, userLat, userLng) => {
  return [...items].sort((a, b) => {
    const distA = calculateDistance(userLat, userLng, a.location?.lat, a.location?.lng) ?? Infinity;
    const distB = calculateDistance(userLat, userLng, b.location?.lat, b.location?.lng) ?? Infinity;
    return distA - distB;
  });
};
