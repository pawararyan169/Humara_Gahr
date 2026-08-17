import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyByUO4jJMyhNv_71ydnGa8pB1bCqU5U6HQ",
    authDomain: "humara-ghar-189e9.firebaseapp.com",
    projectId: "humara-ghar-189e9",
    storageBucket: "humara-ghar-189e9.firebasestorage.app",
    messagingSenderId: "234753099186",
    appId: "1:234753099186:web:01a8ed9857576ddd7310ab",
    measurementId: "G-Z3FTR0YFFZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
