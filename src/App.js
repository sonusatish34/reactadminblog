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

function App() {
  // const [authToken, setauthToken] = useState(false);
  const authToken = localStorage.getItem("authToken");
  
  const ds=1;

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

        {/* Catch all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
