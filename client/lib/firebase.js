import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDEJKnW6ees67aE-ASdVL3PONMPTFq0ULE",
  authDomain: "lost-found-portal-c8e46.firebaseapp.com",
  databaseURL: "https://lost-found-portal-c8e46-default-rtdb.firebaseio.com",
  projectId: "lost-found-portal-c8e46",
  storageBucket: "lost-found-portal-c8e46.appspot.com",
  messagingSenderId: "543242831455",
  appId: "1:543242831455:web:3e8460967432848e2d3dea",
  measurementId: "G-67XDSTXX9H"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getDatabase(app);
export const storage = getStorage(app);
