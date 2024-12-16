import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./Login/Login";
import Dashboard from "./Admin/Dashboard/Dashboard";
import Posts from "./Admin/Posts/Posts";
import Categories from "./Admin/Categories/Categories";
import Inbox from "./Admin/Inbox/Inbox";
import Accounts from "./Admin/Accounts/Accounts";
import Add from "./Admin/Posts/NewPost";
import View from "./Admin/Posts/ViewPost";
import UpdatePost from "./Admin/Posts/UpdatePost";
import NotFound from "./layouts/PageNotFound";
import DeletedPosts from "./Admin/Posts/deleteposts";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";

function App() {
  // const [authToken, setauthToken] = useState(false);
  
  const ds=1;


// Initialize Firestore
const db = getFirestore();

// Get the authToken from localStorage
const authToken = localStorage.getItem("authToken");

// Function to verify the authToken
async function verifyAuthToken() {
  if (!authToken) {
    console.log("Auth token not found in localStorage.");
    return;
  }

  try {
    // Reference to the document in 'users' collection with the authToken as document ID
    const userRef = doc(db, "users", authToken);
    
    // Fetch the document
    const docSnapshot = await getDoc(userRef);
    
    if (docSnapshot.exists()) {
      // Document exists, authentication successful
      console.log(" user is valid. User data:");
    } else {
      // Document does not exist
      console.log("Auth token is invalid.");
    }
  } catch (error) {
    // Handle any errors
    console.error("Error verifying auth token:", error);
  }
}

// Call the verify function
useEffect(()=>{
  verifyAuthToken();
},[])


  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/Login"
          element={authToken ? <Navigate to="/Admin/Dashboard" /> : <Login />}
        />
        <Route
          path="/"
          element={authToken ? <Dashboard /> : <Navigate to="/Login" />}
        />
        <Route
          path="/Admin"
          element={authToken ? <Dashboard /> : <Navigate to="/Login" />}
        />
        <Route
          path="/Admin/Dashboard"
          element={authToken ? <Dashboard /> : <Navigate to="/Login" />}
        />
        <Route
          path="/Admin/Posts"
          element={authToken ? <Posts /> : <Navigate to="/Login" />}
        />
        <Route
          path="/Admin/Post/New"
          element={authToken ? <Add /> : <Navigate to="/Login" />}
        />
        <Route
          path="/Admin/Posts/UpdatePost/:id"
          element={authToken ? <UpdatePost /> : <Navigate to="/Login" />}
        />
        <Route
          path="/Admin/Posts/:id"
          element={authToken ? <View /> : <Navigate to="/Login" />}
        />
        <Route
          path="/Admin/Categories"
          element={authToken ? <Categories /> : <Navigate to="/Login" />}
        />
        <Route
          path="/Admin/Inbox"
          element={<Inbox/>}
        />
        <Route
          path="/Admin/Accounts"
          element={authToken ? <Accounts /> : <Navigate to="/Login" />}
        />
         <Route path="/Admin/DeletedPosts" element={<DeletedPosts />} />


        {/* Catch all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
