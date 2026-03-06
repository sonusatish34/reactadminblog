import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDocs, collection } from "firebase/firestore";
import { fireDb } from "../firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [redirect, setRedirect] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const usersCollectionRef = collection(fireDb, "users");
      const querySnapshot = await getDocs(usersCollectionRef);

      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const foundUser = usersData.find(
        (user) => user.email === email && user.password === password
      );

      if (foundUser) {
        localStorage.setItem("authToken", foundUser.id);
        localStorage.setItem("AdminName", foundUser.name);

        setRedirect(true);
        setError(null);
      } else {
        setError("Invalid email or password.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("An error occurred while verifying credentials.");
    }
  };

  useEffect(() => {
    if (redirect) {
      navigate("/Admin/Dashboard");
    }
  }, [redirect, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div
        className="w-full max-w-md p-6 bg-white rounded shadow-md"
        style={{ marginTop: "-50px" }}
      >
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
              placeholder="Enter email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block font-medium text-gray-700"
            >
              Password
            </label>

            <input
              type="password"
              name="password"
              id="password"
              className="mt-1 p-2 border rounded w-full"
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="text-center">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;