

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./Login/Login";
import Dashboard from "./Admin/Dashboard/Dashboard";
import Posts from "./Admin/Posts/Posts";
import Categories from "./Admin/Categories/Categories";
import Inbox from "./Admin/Inbox/Inbox";
import Accounts from "./Admin/Accounts/Accounts";
import Add from "./Admin/Posts/NewPost";
import Vio from "./Admin/Vio/TextEditor";
import View from "./Admin/Posts/ViewPost";
import UpdatePost from "./Admin/Posts/UpdatePost";
import ViewMessage from "./Admin/Inbox/ViewMessage";
import { Logout } from "./Api/Api";
import NotFound from "./layouts/PageNotFound";
import SnapShot from './SnapShot/SnapShot';

function App() {
  // Check if the user is authenticated
  const isAuthenticated = localStorage.getItem('authToken');
  // console.log(isAuthenticated,"-----------a-------");
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/Login" element={<Login />} />
        <Route path="/Logout" element={<Logout />} />
        
        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/Login" />} />
        <Route path="/Admin" element={ <Dashboard />} />
        <Route path="/Admin/Dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/Login" />} />
        <Route path="/Admin/Posts" element={isAuthenticated ? <Posts /> : <Navigate to="/Login" />} />
        <Route path="/Admin/Post/New" element={isAuthenticated ? <Add /> : <Navigate to="/Login" />} />
        <Route path="/Admin/Vio/Vio" element={isAuthenticated ? <Vio /> : <Navigate to="/Login" />} />
        <Route path="/Admin/Posts/UpdatePost/:id" element={isAuthenticated ? <UpdatePost /> : <Navigate to="/Login" />} />
        <Route path="/Admin/Posts/:id" element={isAuthenticated ? <View /> : <Navigate to="/Login" />} />
        <Route path="/Admin/Categories" element={isAuthenticated ? <Categories /> : <Navigate to="/Login" />} />
        <Route path="/Admin/Inbox" element={isAuthenticated ? <Inbox /> : <Navigate to="/Login" />} />
        <Route path="/Admin/Inbox/:id" element={isAuthenticated ? <ViewMessage /> : <Navigate to="/Login" />} />
        <Route path="/Admin/Accounts" element={isAuthenticated ? <Accounts /> : <Navigate to="/Login" />} />
        
        {/* Catch all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
