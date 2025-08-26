// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgTsrKiR6yAS0mnzvMHxcmWrry0IDkd0Y",
  authDomain: "birthday-eba10.firebaseapp.com",
  projectId: "birthday-eba10",
  storageBucket: "birthday-eba10.firebasestorage.app",
  messagingSenderId: "590156421358",
  appId: "1:590156421358:web:768eff4a8e8a481ee7fbff",
  measurementId: "G-01M7SGSN3M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };