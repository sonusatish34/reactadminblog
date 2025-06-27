// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcyVasMykMUUKdh-vB19Wjk2Op5rVOqsE",Add commentMore actions
  authDomain: "seoblog-30557.firebaseapp.com",
  projectId: "seoblog-30557",
  storageBucket: "seoblog-30557.firebasestorage.app",
  messagingSenderId: "37436496345",
  appId: "1:37436496345:web:b3916839656826ec7d21c8"
  // apiKey: "AIzaSyDcyVasMykMUUKdh-vB19Wjk2Op5rVOqsE",
  // authDomain: "seoblog-30557.firebaseapp.com",
  // projectId: "seoblog-30557",
  // storageBucket: "seoblog-30557.firebasestorage.app",
  // messagingSenderId: "37436496345",
  // appId: "1:37436496345:web:b3916839656826ec7d21c8"

};

const app = initializeApp(firebaseConfig);

const fireDb = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { fireDb, auth, storage }
