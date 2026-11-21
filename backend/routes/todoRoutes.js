const express = require("express");
const Todo = require("../models/Todo");
const authenticate = require("../authenticate");

const router = express.Router();

// Create a Todo
router.post("/todos", authenticate, async (req, res) => {
  const { task } = req.body;
  try {
    const todo = await Todo.create({ task, user: req.user.id });
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all Todos for a user
router.get("/todos", authenticate, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id });
    res.json(todos);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a Todo (Mark as completed or edit task)
router.put("/todos/:id", authenticate, async (req, res) => {
  const { task, completed } = req.body; // Allow either task text or completion status to be updated
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // Ensure the todo belongs to the authenticated user
    if (todo.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You do not have permission to update this todo" });
    }

    // Update task text or completion status
    if (task) todo.task = task;
    if (completed !== undefined) todo.completed = completed;

    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a Todo
router.delete("/todos/:id", authenticate, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // Ensure the todo belongs to the authenticated user
    if (todo.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this todo" });
    }

    // Use findByIdAndDelete instead of remove
    await Todo.findByIdAndDelete(req.params.id);

    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
