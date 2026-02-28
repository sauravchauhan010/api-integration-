import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBth_1AilBLr-x4LiHvlGvWpbk4G4XDfPk",
  authDomain: "dara-d54e7.firebaseapp.com",
  databaseURL: "https://dara-d54e7-default-rtdb.firebaseio.com",
  projectId: "dara-d54e7",
  storageBucket: "dara-d54e7.firebasestorage.app",
  messagingSenderId: "457852810868",
  appId: "1:457852810868:web:31ef63e0391a565cc28321",
  measurementId: "G-WHTLGEGM5L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Analytics is only available in browser
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, db, auth, analytics };
