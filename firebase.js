
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-storage.js";


// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIvTLpNtAY_qFoko4CS8UG8zoSotAoEuI",
  authDomain: "codefolio-3de28.firebaseapp.com",
  projectId: "codefolio-3de28",
  storageBucket: "codefolio-3de28.firebasestorage.app",
  messagingSenderId: "201776618099",
  appId: "1:201776618099:web:50b7738cc1a84d7f356806"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Firebase Authentication
const auth = getAuth(app);


// Firestore Database
const db = getFirestore(app);


// Firebase Storage
const storage = getStorage(app);


// Google Authentication Provider
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account"
});


// Export Firebase functions
export {
  app,
  auth,
  db,
  storage,
  googleProvider,

  // Authentication
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signOut,

  // Firestore
  doc,
  getDoc,
  setDoc,
  serverTimestamp,

  // Storage
  ref,
  uploadBytes,
  getDownloadURL
};
