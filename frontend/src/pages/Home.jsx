import React from 'react';

const Home = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to the To-Do List App</h1>
        <p className="text-lg text-gray-600 mb-8">Keep track of your tasks efficiently.</p>
        <div>
          <a
            href="/login"
            className="text-xl text-blue-500 hover:text-blue-700 transition duration-300 mx-4"
          >
            Login
          </a>
          |
          <a
            href="/signup"
            className="text-xl text-blue-500 hover:text-blue-700 transition duration-300 mx-4"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
