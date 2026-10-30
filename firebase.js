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


const firebaseConfig = {
  apiKey: "AIzaSyDIvTLpNtAY_qFoko4CS8UG8zoSotAoEuI",
  authDomain: "codefolio-3de28.firebaseapp.com",
  projectId: "codefolio-3de28",
  storageBucket: "codefolio-3de28.firebasestorage.app",
  messagingSenderId: "201776618099",
  appId: "1:201776618099:web:50b7738cc1a84d7f356806"
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);


const db = getFirestore(app);


const storage = getStorage(app);


const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account"
});


export {
  app,
  auth,
  db,
  storage,
  googleProvider,

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

  doc,
  getDoc,
  setDoc,
  serverTimestamp,

  ref,
  uploadBytes,
  getDownloadURL
};
