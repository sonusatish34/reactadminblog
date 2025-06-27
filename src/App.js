import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./Login/Login";
import Dashboard from "./Admin/Dashboard/Dashboard";
import TripAdvsior from "./Admin/TripAdvisor/TripAdvisor";
import ImageTesting from "./Admin/TripAdvisor/ImageTesting";
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

  const ds = 1;
  const db = getFirestore();

  const authToken = localStorage.getItem("authToken");


  async function verifyAuthToken() {
    if (!authToken) {
      console.log("Auth token not found in localStorage.");
      return;
    }

    try {
      const userRef = doc(db, "users", authToken);

      const docSnapshot = await getDoc(userRef);

      if (docSnapshot.exists()) {
        console.log(" user is valid. User data:");
      } else {
        console.log("Auth token is invalid.");
      }
    } catch (error) {
      console.error("Error verifying auth token:", error);
    }
  }

  useEffect(() => {
    verifyAuthToken();
  }, [])


  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/Login"
          element={authToken ? <Navigate to="/Admin/Dashboard" /> : <Login />}
        />
        <Route
          path="/Admin/TripAdvisor"
          element={<TripAdvsior />}
        />
        <Route
          path="/Admin/ImageTesting"
          element={<ImageTesting />}
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
          element={<Inbox />}
        />
        <Route
          path="/Admin/Accounts"
          element={authToken ? <Accounts /> : <Navigate to="/Login" />}
        />
        <Route path="/Admin/DeletedPosts" element={<DeletedPosts />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
