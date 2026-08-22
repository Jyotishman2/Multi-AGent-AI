import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cortexai-249a8.firebaseapp.com",
  projectId: "cortexai-249a8",
  storageBucket: "cortexai-249a8.firebasestorage.app",
  messagingSenderId: "1019368762120",
  appId: "1:1019368762120:web:3b98fa89be244999e25abd",
  measurementId: "G-B3LEH8NRRC",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();