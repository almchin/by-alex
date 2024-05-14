import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAyuZCyHNlghYU3oQ5WAenq1gMxNd8e9tQ",
    authDomain: "by-alex.firebaseapp.com",
    projectId: "by-alex",
    storageBucket: "by-alex.appspot.com",
    messagingSenderId: "433636625",
    appId: "1:433636625:web:768005676b15661baa38b0",
    measurementId: "G-DRDJYZBP8Q"
  };
  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, provider, db, storage };
