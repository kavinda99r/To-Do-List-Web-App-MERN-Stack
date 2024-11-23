import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaCheckCircle, FaTrash, FaEdit } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify"; // Importing toastify components
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for Toastify

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const listRef = useRef(null); // To track the todo list container for scroll behavior

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
        style: { backgroundColor: "green", color: "white" },
      }); // Green toast for task added
    } catch (err) {
      console.error(err);
      toast.error("Error adding task", {
        style: { backgroundColor: "red", color: "white" },
      }); // Red toast for error
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
          style: { backgroundColor: "green", color: "white" },
        }
      ); // Green toast for completed task
    } catch (err) {
      console.error(err);
      toast.error("Error updating task", {
        style: { backgroundColor: "red", color: "white" },
      }); // Red toast for error
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
        style: { backgroundColor: "red", color: "white" },
      }); // Red toast for task deleted
    } catch (err) {
      console.error(
        "Error deleting task:",
        err.response?.data?.message || err.message
      );
      toast.error("Error deleting task", {
        style: { backgroundColor: "red", color: "white" },
      }); // Red toast for error
    }
  };

  // Edit task
  const handleEditTodo = async (id, newTask) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `http://localhost:5001/api/todos/${id}`,
        { task: newTask },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(todos.map((todo) => (todo._id === id ? response.data : todo)));
      setEditingTask(null);
      toast.info("Task updated successfully!", {
        style: { backgroundColor: "blue", color: "white" },
      }); // Blue toast for task updated
    } catch (err) {
      console.error(err);
      toast.error("Error updating task", {
        style: { backgroundColor: "red", color: "white" },
      }); // Red toast for error
    }
  };

  // Scroll to bottom when new task is added or when there are more than 5 tasks
  useEffect(() => {
    if (todos.length > 5) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [todos]);

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
        To-Do List
      </h2>

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
          className="w-[200px] bg-blue-500 text-white rounded-[4px] shadow-md hover:bg-blue-600 focus:outline-none transition duration-200"
        >
          Add Task
        </button>
      </form>

      <ul
        ref={listRef}
        className="space-y-6 overflow-auto max-h-96" // Added padding to the left (pl-4)
        style={{
          paddingRight: "10px",
          scrollbarWidth: "thin", // Firefox
          scrollbarColor: "#A0AEC0 #F7FAFC", // Firefox scrollbar color (gray thumb, light background)
        }}
      >
        {todos.map((todo) => (
          <li
            key={todo._id}
            className="flex items-center justify-between p-4 bg-white rounded-[4px] border-[1px] border-slate-500 hover:bg-gray-100 transition duration-300 cursor-pointer"
          >
            {editingTask === todo._id ? (
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  defaultValue={todo.task}
                  onBlur={(e) => handleEditTodo(todo._id, e.target.value)}
                  className="p-3 border-2 border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                />
                <button
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-red-500 hover:bg-red-100 rounded-md transition duration-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span
                  style={{
                    textDecoration: todo.completed ? "line-through" : "none",
                  }}
                  className="flex-1 text-gray-700 text-lg font-medium"
                >
                  {todo.task}
                </span>
                <div className="flex space-x-4">
                  <FaCheckCircle
                    onClick={() =>
                      handleToggleComplete(todo._id, todo.completed)
                    }
                    className={`cursor-pointer ${
                      todo.completed ? "text-green-500" : "text-gray-500"
                    } hover:text-green-600 transition duration-200`}
                  />
                  <FaTrash
                    onClick={() => handleDeleteTodo(todo._id)}
                    className="cursor-pointer text-red-500 hover:text-red-700 transition duration-200"
                  />
                  <FaEdit
                    onClick={() => setEditingTask(todo._id)}
                    className="cursor-pointer text-blue-500 hover:text-blue-700 transition duration-200"
                  />
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Toast Container for global notifications */}
      <ToastContainer />
    </div>
  );
};

export default TodoList;
