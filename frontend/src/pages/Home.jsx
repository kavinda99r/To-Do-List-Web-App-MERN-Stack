import React from "react";
import { Link } from "react-router-dom";
import Image from "../assets/Logo 2.png";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-5">
      {/* Main Section */}
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center justify-center flex-col text-center p-10 bg-white bg-opacity-80 rounded-lg shadow-xl">
          <img
            src={Image}
            alt="Logo"
            className="h-28 w-28 md:h-36 md:w-36 mb-4"
          />
          {/* TaskMate Title with Gradient */}
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Task
            </span>
            Mate
          </h1>

          <h2 className="text-3xl font-semibold text-gray-800 mb-3">
            Stay on top of your tasks and boost your productivity.
          </h2>

          <p className="text-lg text-gray-600 mb-8">
            Efficiently manage your to-do list, set goals, and get things done
            with ease.
          </p>

          <div className="grid md:flex justify-center gap-3">
            <Link
              to="/login"
              className="text-lg bg-blue-600 text-white px-24 md:px-6 py-2 rounded-[4px] hover:bg-blue-700 transition duration-300"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="text-lg border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-[4px] hover:bg-blue-600 hover:text-white transition duration-300"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
