// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; // Import the getStorage function to use Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-auth-17725.firebaseapp.com",
  projectId: "mern-auth-17725",
  storageBucket: "mern-auth-17725.appspot.com", // This is the storage bucket where files will be uploaded
  messagingSenderId: "706164001915",
  appId: "1:706164001915:web:22aad7d6c1b9f09ea766de"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage and export it for use in other parts of your application
export const storage = getStorage(app);
