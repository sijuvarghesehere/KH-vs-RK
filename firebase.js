// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  onValue,
  update
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBJMxsv_Eoc9wmAaDTBP5yizC74Sq2Qbx8",
  authDomain: "kh-vs-rk.firebaseapp.com",
  databaseURL: "https://kh-vs-rk-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kh-vs-rk",
  storageBucket: "kh-vs-rk.firebasestorage.app",
  messagingSenderId: "964165675585",
  appId: "1:964165675585:web:81684da230f70398e1b4c0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Database
const db = getDatabase(app);

// Export
export { db, ref, set, onValue, update };
