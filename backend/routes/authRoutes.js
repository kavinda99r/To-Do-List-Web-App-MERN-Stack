const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const Todo = require("../models/Todo");
const authenticate = require("../authenticate");

const router = express.Router();

// Passwords are hashed in the User model. Bcrypt supports up to 72 bytes.
function isValidPassword(password) {
  if (typeof password !== "string") return false;
  return password.length >= 8 && Buffer.byteLength(password, "utf8") <= 72;
}

// The version lets password changes and logout invalidate older tokens.
function createToken(user) {
  return jwt.sign(
    { id: user._id, version: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
}

// User signup
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const hasUsername =
    typeof username === "string" && username.trim().length > 0;
  const hasEmail =
    typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!hasUsername || !hasEmail || !isValidPassword(password)) {
    return res
      .status(400)
      .json({
        message:
          "Enter your name, a valid email, and a password of at least 8 characters (up to 72 bytes).",
      });
  }
  try {
    const user = await User.create({ username, email, password });
    const token = createToken(user);
    res.status(201).json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email ||
    !password
  ) {
    return res.status(400).json({ message: "Enter your email and password" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = createToken(user);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/logout", authenticate, async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.account._id },
      { $inc: { tokenVersion: 1 } },
    );
    res.json({ message: "Signed out" });
  } catch {
    res.status(500).json({ message: "Unable to log out. Please try again." });
  }
});

router.get("/me", authenticate, (req, res) => {
  res.json({ username: req.account.username, email: req.account.email });
});

router.put("/password", authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== "string" || !isValidPassword(newPassword)) {
    return res
      .status(400)
      .json({
        message:
          "Use a new password with at least 8 characters and no more than 72 bytes.",
      });
  }
  try {
    const user = req.account;
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    if (await user.matchPassword(newPassword)) {
      return res
        .status(400)
        .json({ message: "Choose a different new password" });
    }
    user.password = newPassword;
    user.tokenVersion += 1;
    await user.save();
    const token = createToken(user);
    res.json({ token, message: "Password updated" });
  } catch {
    res
      .status(500)
      .json({ message: "Unable to change password. Please try again." });
  }
});

router.delete("/me", authenticate, async (req, res) => {
  const { password } = req.body;
  if (typeof password !== "string" || !password) {
    return res
      .status(400)
      .json({ message: "Enter your password to delete your account" });
  }
  try {
    if (!(await req.account.matchPassword(password))) {
      return res.status(400).json({ message: "Password is incorrect" });
    }
    await Todo.deleteMany({ user: req.account._id });
    await User.findByIdAndDelete(req.account._id);
    res.json({ message: "Account and tasks deleted" });
  } catch {
    res
      .status(500)
      .json({ message: "Unable to delete account. Please try again." });
  }
});

module.exports = router;
