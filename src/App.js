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
  const db = getFirestore();
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    async function verifyAuthToken() {
      if (!authToken) {
        console.log("Auth token not found in localStorage.");
        return;
      }

      try {
        const userRef = doc(db, "users", authToken);
        const docSnapshot = await getDoc(userRef);

        if (docSnapshot.exists()) {
          console.log("User is valid.");
        } else {
          console.log("Auth token is invalid.");
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("Error verifying auth token:", error);
      }
    }

    verifyAuthToken();
  }, [authToken, db]);

  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/Login"
          element={authToken ? <Navigate to="/Admin/Dashboard" /> : <Login />}
        />

        {/* Dashboard */}
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

        {/* Trip Advisor */}
        <Route
          path="/Admin/TripAdvisor"
          element={authToken ? <TripAdvsior /> : <Navigate to="/Login" />}
        />

        <Route
          path="/Admin/ImageTesting"
          element={authToken ? <ImageTesting /> : <Navigate to="/Login" />}
        />

        {/* Posts */}
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

        {/* Categories */}
        <Route
          path="/Admin/Categories"
          element={authToken ? <Categories /> : <Navigate to="/Login" />}
        />

        {/* Inbox */}
        <Route
          path="/Admin/Inbox"
          element={authToken ? <Inbox /> : <Navigate to="/Login" />}
        />

        {/* Accounts */}
        <Route
          path="/Admin/Accounts"
          element={authToken ? <Accounts /> : <Navigate to="/Login" />}
        />

        {/* Deleted Posts */}
        <Route
          path="/Admin/DeletedPosts"
          element={authToken ? <DeletedPosts /> : <Navigate to="/Login" />}
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;