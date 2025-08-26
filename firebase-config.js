// Use your own Firebase configuration
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
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
