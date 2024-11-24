import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoHome } from "react-icons/io5";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/signup",
        { username, email, password }
      );
      localStorage.setItem("token", response.data.token);
      toast.success("Account created successfully! Redirecting...");
      setTimeout(() => {
        window.location.href = "/todos"; // Redirect to todos page after a brief delay
      }, 2000);
    } catch (err) {
      const errorMessage = "An account with this email already exists";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Main Section */}
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-100">
        <div className="relative text-center p-10 bg-white rounded-lg shadow-lg w-full max-w-md">
          {/* Back Icon */}
          <div className="flex justify-between items-center ">
            <div>
              {/* Login Title with Gradient */}
              <h1 className="text-lg font-bold text-left">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Task
                </span>
                Mate
              </h1>
            </div>
            <div>
              <Link to="/">
                <button
                  className="p-2 rounded-[5px]  transition-all hover:bg-gray-100"
                  aria-label="Go Back"
                >
                  <IoHome className="h-6 w-6 text-gray-600" />
                </button>
              </Link>
            </div>
          </div>
          <h1 className="text-4xl text-gray-600 font-semibold text-center mt-2 mb-6">
            Sign Up
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-left text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-gray-100 mt-2 w-full px-4 py-3 border border-gray-300 rounded-[4px] outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-left text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-100 mt-2 w-full px-4 py-3 border border-gray-300 rounded-[4px] outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-left text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-100 mt-2 w-full px-4 py-3 border border-gray-300 rounded-[4px] outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-[4px] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              >
                Sign Up
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:text-blue-700">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
