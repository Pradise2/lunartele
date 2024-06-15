import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyAURFbyDHkq626UusPHMijpxmcUOOl5-Tw",
  authDomain: "test-f326f.firebaseapp.com",
  projectId: "test-f326f",
  storageBucket: "test-f326f.appspot.com",
  messagingSenderId: "626801402709",
  appId: "1:626801402709:web:d3653b964333a0de6845dc",
  measurementId: "G-517PH4LM9K"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore database
const db = getFirestore(app);

// Function to save progress
export async function saveProgress(userId, data) {
    const docRef = doc(db, "users", userId.toString());
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const existingData = docSnap.data();
        const newData = { ...existingData, ...data };
        console.log('Existing data:', existingData);
        console.log('New data to save:', newData);
        await setDoc(docRef, newData);
    } else {
        console.log('Creating new document with data:', data);
        await setDoc(docRef, data);
    }
    console.log('Progress saved');
}

// Function to get progress
export async function getProgress(userId) {
    const docRef = doc(db, "users", userId.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.log('No such document! Creating new user...');
        // Create a new user with initial data
        const initialData = {
            userId: userId.toString(),
            username: '',
            
        };
        
        await saveProgress(userId, initialData);
        return initialData;
    }
}
