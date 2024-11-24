import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaTrash, FaEdit, FaRegCircle } from "react-icons/fa";
import { IoAdd } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const listRef = useRef(null);

  // Fetch todos from the backend
  useEffect(() => {
    const fetchTodos = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:5001/api/todos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodos(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTodos();
  }, []);

  // Add a new task
  const handleAddTodo = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        "http://localhost:5001/api/todos",
        { task },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTodos([...todos, response.data]);
      setTask("");
      toast.success("Task added successfully!", {
        style: { backgroundColor: "white", color: "gray" },
      });
    } catch (err) {
      console.error(err);
      toast.error("Error adding task", {
        style: { backgroundColor: "white", color: "gray" },
      });
    }
  };

  // Mark task as completed
  const handleToggleComplete = async (id, currentStatus) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `http://localhost:5001/api/todos/${id}`,
        { completed: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(todos.map((todo) => (todo._id === id ? response.data : todo)));
      toast.success(
        currentStatus ? "Task marked as incomplete" : "Task completed!",
        {
          style: { backgroundColor: "white", color: "gray" },
        }
      );
    } catch (err) {
      console.error(err);
      toast.error("Error updating task", {
        style: { backgroundColor: "white", color: "gray" },
      });
    }
  };

  // Delete task
  const handleDeleteTodo = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5001/api/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(todos.filter((todo) => todo._id !== id));
      toast.error("Task deleted successfully!", {
        style: { backgroundColor: "white", color: "gray" },
      });
    } catch (err) {
      console.error(
        "Error deleting task:",
        err.response?.data?.message || err.message
      );
      toast.error("Error deleting task", {
        style: { backgroundColor: "white", color: "gray" },
      });
    }
  };

  // Edit task
  const handleEditTodo = async (id, newTask) => {
    if (!newTask.trim()) {
      toast.error("Task cannot be empty!", {
        style: { backgroundColor: "white", color: "gray" },
      });
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `http://localhost:5001/api/todos/${id}`,
        { task: newTask },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(todos.map((todo) => (todo._id === id ? response.data : todo)));
      setEditingTask(null); // Exit editing mode
      setTask(""); // Clear the input field
      toast.info("Task updated successfully!", {
        style: { backgroundColor: "white", color: "gray" },
      });
    } catch (err) {
      console.error(err);
      toast.error("Error updating task", {
        style: { backgroundColor: "white", color: "gray" },
      });
    }
  };

  // Cancel editing task and clear input field
  const handleCancelEdit = () => {
    setEditingTask(null); // Exit editing mode
    setTask(""); // Clear the task input field
  };

  // Scroll to bottom when new task is added or when there are more than 5 tasks
  useEffect(() => {
    if (todos.length > 5) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [todos]);

  return (
    <div className="flex justify-center py-10 h-screen bg-gray-100 px-5">
      <div className="container mx-auto p-8 max-w-3xl shadow-lg rounded-[4px] bg-white">
        <div className="flex justify-between items-center mb-10">
          <div>
            {/* Login Title with Gradient */}
            <h1 className="text-4xl font-bold text-left">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Task
              </span>
              Mate
            </h1>
          </div>
          <div>
            <Link to="/">
              <button
                className="flex items-center gap-2 p-2 rounded-[5px] border-[1px] border-gray-400 transition-all hover:bg-gray-100"
                aria-label="Go Back"
              >
                <FiLogOut className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">Logout</span>
              </button>
            </Link>
          </div>
        </div>

        <form onSubmit={handleAddTodo} className="mb-8 flex space-x-4">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Add a new task"
            className="w-full p-4 border-2 border-gray-300 rounded-[4px] outline-none focus:border-blue-500 transition duration-300"
          />
          <button
            type="submit"
            className="w-[80px] bg-blue-500 text-white rounded-[4px] hover:bg-blue-600 outline-none flex items-center justify-center transition duration-200"
          >
            <IoAdd className="text-3xl" /> {/* Enlarged icon */}
          </button>
        </form>

        <ul
          ref={listRef}
          className="space-y-3 overflow-auto max-h-96"
          style={{
            paddingRight: "10px",
            scrollbarWidth: "thin",
            scrollbarColor: "#A0AEC0 #F7FAFC",
          }}
        >
          {todos.map((todo) => (
            <li
              key={todo._id}
              className="flex items-center justify-between p-4 bg-white rounded-[4px] border-2 border-gray-300 hover:bg-gray-100 transition duration-300 cursor-pointer"
            >
              <div className="flex items-center space-x-4 flex-1">
                {todo.completed ? (
                  <FaCheckCircle
                    onClick={() =>
                      handleToggleComplete(todo._id, todo.completed)
                    }
                    className="cursor-pointer text-green-500 hover:text-green-600 transition duration-200"
                  />
                ) : (
                  <FaRegCircle
                    onClick={() =>
                      handleToggleComplete(todo._id, todo.completed)
                    }
                    className="cursor-pointer text-gray-400 hover:text-gray-700 transition duration-200"
                  />
                )}

                {editingTask === todo._id ? (
                  <div className="flex flex-col w-full space-y-2">
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      className="px-2 py-1 border-2 border-gray-300 rounded-[4px] outline-none focus:border-blue-500 transition duration-300"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleEditTodo(todo._id, task)}
                        className="px-4 py-2 text-blue-500 bg-blue-100 hover:bg-blue-200 rounded-md transition duration-200"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit} // Reset task state and exit editing
                        className="px-4 py-2 text-red-500 bg-red-100 hover:bg-red-200 rounded-md transition duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <span
                    style={{
                      textDecoration: todo.completed ? "line-through" : "none",
                    }}
                    className="text-gray-700 text-lg font-medium"
                  >
                    {todo.task}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {!editingTask && (
                  <FaEdit
                    onClick={() => {
                      setEditingTask(todo._id);
                      setTask(todo.task);
                    }}
                    className="cursor-pointer text-blue-500 hover:text-blue-600 transition duration-200"
                  />
                )}

                <FaTrash
                  onClick={() => handleDeleteTodo(todo._id)}
                  className="cursor-pointer text-red-500 hover:text-red-600 transition duration-200"
                />
              </div>
            </li>
          ))}
        </ul>

        {/* Move ToastContainer to top-right */}
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={true}
        />
      </div>
    </div>
  );
};

export default TodoList;
