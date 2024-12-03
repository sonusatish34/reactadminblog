// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQ-o1pBcVmuC9CRhnj2YvHdcHjMwT39F8",
  authDomain: "myblog-20a5b.firebaseapp.com",
  projectId: "myblog-20a5b",
  storageBucket: "myblog-20a5b.firebasestorage.app",
  messagingSenderId: "72839760896",
  appId: "1:72839760896:web:946803b8efd18b83581ce5"



  // new db

  // apiKey: "AIzaSyDcyVasMykMUUKdh-vB19Wjk2Op5rVOqsE",
  // authDomain: "seoblog-30557.firebaseapp.com",
  // projectId: "seoblog-30557",
  // storageBucket: "seoblog-30557.firebasestorage.app",
  // messagingSenderId: "37436496345",
  // appId: "1:37436496345:web:b3916839656826ec7d21c8"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const fireDb = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { fireDb, auth, storage }