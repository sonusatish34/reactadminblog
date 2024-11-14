import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDocs, collection } from "firebase/firestore";
import { fireDb } from "../firebase"; // Your Firebase config file

function Login() {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch users from Firestore
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Reference to the 'users' collection in Firestore
      const usersCollectionRef = collection(fireDb, "users");

      // Get all users data from Firestore
      const querySnapshot = await getDocs(usersCollectionRef);
      const usersData = querySnapshot.docs.map(doc => doc.data()); // Convert docs to data array

      // Check if the entered email and password match any stored user
      const foundUser = usersData.find((user) => user.email === email && user.password === password);

      if (foundUser) {
        // If user is found, login successful
        console.log("Login successful:", foundUser.name);

        // Store user details in sessionStorage or localStorage
        localStorage.setItem("authToken", foundUser.id); // You can generate or retrieve an actual auth token
        localStorage.setItem("AdminName", foundUser.name);
        localStorage.setItem("AdminEmail", foundUser.email);

        // Navigate to the admin page or any other protected route
        navigate("/Admin");
        
        setError(null); // Clear any previous errors
      } else {
        // If user is not found, display an error message
        setError("Invalid email or password.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("An error occurred while verifying credentials.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded shadow-md" style={{ marginTop: "-50px" }}>
        <h2 className="text-2xl font-semibold mb-4">Login</h2>

        <form onSubmit={handleLogin}>
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
            <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600" type="submit">
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
