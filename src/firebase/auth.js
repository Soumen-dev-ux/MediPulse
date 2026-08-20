import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";

import { auth } from "./config";


// ================================
// EMAIL REGISTER
// ================================

export const registerWithEmail = async (email, password) => {
  const result = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  return result.user;
};


// ================================
// EMAIL LOGIN
// ================================

export const loginWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return result.user;
};


// ================================
// GOOGLE LOGIN
// ================================

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    const popupUnavailable = [
      "auth/popup-blocked",
      "auth/operation-not-supported-in-this-environment",
    ].includes(error.code);

    if (popupUnavailable) {
      await signInWithRedirect(auth, provider);
    }

    throw error;
  }
};


// ================================
// PHONE OTP
// ================================

export const setupRecaptcha = (containerId) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA solved");
        },
        "expired-callback": () => {
          window.recaptchaVerifier = null;
        },
      }
    );
  }

  return window.recaptchaVerifier;
};


export const sendPhoneOTP = async (phoneNumber) => {
  const appVerifier = setupRecaptcha("recaptcha-container");

  const confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    appVerifier
  );

  window.confirmationResult = confirmationResult;

  return confirmationResult;
};


// ================================
// LOGOUT
// ================================

export const logoutUser = async () => {
  await signOut(auth);
};