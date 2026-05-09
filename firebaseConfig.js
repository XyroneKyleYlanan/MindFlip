import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC4-g7HfbPS5xymgijYU1VW7YEkGyUdmtM",
  authDomain: "mindflip-fa04b.firebaseapp.com",
  projectId: "mindflip-fa04b",
  storageBucket: "mindflip-fa04b.firebasestorage.app",
  messagingSenderId: "837502824141",
  appId: "1:837502824141:web:9bc9ed8911417d40aa4384"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);