import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-">
      {/* Main Section */}
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-900">
        <div className="text-center  p-10 bg-gray-800 bg-opacity-60 rounded-lg shadow-xl ">
          {/* TaskMate Title with Gradient */}
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              Task
            </span>
            Mate
          </h1>

          <h2 className="text-3xl font-semibold text-gray-100 mb-6">
            Stay on top of your tasks and boost your productivity.
          </h2>

          <p className="text-lg text-gray-400 mb-8">
            Efficiently manage your to-do list, set goals, and get things done
            with ease.
          </p>

          <div className="flex justify-center gap-3">
            <Link to='/login' className="text-lg bg-blue-600 text-white px-6 py-2 rounded-[4px] hover:bg-blue-700 transition duration-300">
            Login
            </Link>
            
            <Link to='/signup' className="text-lg border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-[4px] hover:bg-blue-600 hover:text-white transition duration-300">
            Sign Up
            </Link>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
