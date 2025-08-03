// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBO8syrgejvNMfqAHhylktD2WF6S_vatE8",
  authDomain: "avalon-7dfe4.firebaseapp.com",
  projectId: "avalon-7dfe4",
  storageBucket: "avalon-7dfe4.firebasestorage.app",
  messagingSenderId: "38049517403",
  appId: "1:38049517403:web:46695750fcc17d1469d47e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;