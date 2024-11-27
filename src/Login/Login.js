import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Ensure you import from react-router-dom
import { getDocs, collection } from "firebase/firestore";
import { fireDb } from "../firebase"; // Your Firebase config file
import { Navigate } from 'react-router-dom';
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState(null);
  const [redirect, setRedirect] = useState(false); // Changed initial state to false
  const navigate = useNavigate();

  // Fetch users from Firestore
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    try {
      const usersCollectionRef = collection(fireDb, "users");
      const querySnapshot = await getDocs(usersCollectionRef);
      const usersData = querySnapshot.docs.map(doc => doc.data());
      const foundUser = usersData.find((user) => user.email === email && user.password === password);

      if (foundUser) {
        localStorage.setItem("authToken", foundUser.id);
        localStorage.setItem("AdminName", foundUser.name);
        setRedirect(true); // Set redirect to true
        setError(null); // Clear previous errors
      } else {
        setError("Invalid email or password.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("An error occurred while verifying credentials.");
    }
    finally {
      window.location.reload(false);
    }
  };

  // Handle redirection
  useEffect(() => {
    if (redirect) {

      navigate('/Admin/Dashboard')
    }
  }, [redirect])


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded shadow-md" style={{ marginTop: "-50px" }}>
        <h2 className="text-2xl font-semibold mb-4">Login</h2>

        <form onSubmit={handleLogin}> {/* Add onSubmit handler here */}
          <div className="mb-4">
            <label htmlFor="email" className="block font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="mt-1 p-2 border rounded w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="mt-1 p-2 border rounded w-full"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="text-center">
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
