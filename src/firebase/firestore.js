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
  deleteDoc,
  onSnapshot,
  addDoc,
  orderBy
} from "firebase/firestore";
import { db } from "./config";

// ================================
// USER ROLE & ADMIN MANAGEMENT
// ================================

export const updateUserRole = async (uid, role, extraData = {}) => {
  await updateDoc(doc(db, "users", uid), {
    role,
    ...extraData,
    updatedAt: serverTimestamp(),
  });
};

export const updateUserStatus = async (uid, status) => {
  await updateDoc(doc(db, "users", uid), {
    status,
    updatedAt: serverTimestamp(),
  });
};

export const subscribeAllUsers = (callback) => {
  try {
    const usersRef = collection(db, "users");
    return onSnapshot(
      usersRef,
      (snapshot) => {
        const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(users);
      },
      (error) => {
        console.error("Error subscribing to users:", error);
        callback([]);
      }
    );
  } catch (err) {
    console.error("subscribeAllUsers failed:", err);
    callback([]);
    return () => {};
  }
};

export const deleteUserRecord = async (uid) => {
  await deleteDoc(doc(db, "users", uid));
};

// ================================
// DOCTOR MANAGEMENT & VERIFICATION
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

export const subscribeAllDoctors = (callback) => {
  try {
    const doctorsRef = collection(db, "doctors");
    return onSnapshot(
      doctorsRef,
      (snapshot) => {
        const docsList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(docsList);
      },
      (error) => {
        console.error("Error subscribing to doctors:", error);
        callback([]);
      }
    );
  } catch (err) {
    console.error("subscribeAllDoctors failed:", err);
    callback([]);
    return () => {};
  }
};

export const verifyDoctorProfile = async (uid, verificationStatus, adminNotes = "") => {
  const docRef = doc(db, "doctors", uid);
  await updateDoc(docRef, {
    verificationStatus,
    adminNotes,
    updatedAt: serverTimestamp(),
  });
};

// ================================
// CLINIC / FACILITY MANAGEMENT
// ================================

export const registerClinic = async (uid, data) => {
  await setDoc(doc(db, "facilities", uid), {
    ...data,
    isPublic: true,
    verificationStatus: "pending",
    status: "Operational",
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

export const subscribeAllFacilities = (callback) => {
  try {
    const facilitiesRef = collection(db, "facilities");
    return onSnapshot(
      facilitiesRef,
      (snapshot) => {
        const facilitiesList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(facilitiesList);
      },
      (error) => {
        console.error("Error subscribing to facilities:", error);
        callback([]);
      }
    );
  } catch (err) {
    console.error("subscribeAllFacilities failed:", err);
    callback([]);
    return () => {};
  }
};

export const updateFacilityDetails = async (facilityId, updates) => {
  const facRef = doc(db, "facilities", facilityId);
  await updateDoc(facRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
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
  if (requestorUid !== uid && requestorRole !== "doctor" && requestorRole !== "admin") {
    throw new Error("Access denied: insufficient permissions.");
  }
  return getPatientProfile(uid);
};

// ================================
// AUDIT LOGGING SERVICE
// ================================

export const addAuditLog = async (action, details, performedBy = "Admin") => {
  try {
    const logsRef = collection(db, "audit_logs");
    await addDoc(logsRef, {
      action,
      details,
      performedBy,
      timestamp: new Date().toLocaleString(),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Audit log save failed, logging locally:", err);
  }
};

export const subscribeAuditLogs = (callback) => {
  try {
    const logsRef = collection(db, "audit_logs");
    return onSnapshot(
      logsRef,
      (snapshot) => {
        const logs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(logs);
      },
      (error) => {
        console.error("Error subscribing to audit logs:", error);
        callback([]);
      }
    );
  } catch (err) {
    console.error("subscribeAuditLogs failed:", err);
    callback([]);
    return () => {};
  }
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

