const jwt = require("jsonwebtoken");
const User = require("./models/User");

module.exports = async (req, res, next) => {
  res.set("Cache-Control", "no-store");
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token)
    return res.status(401).json({ message: "Please log in" });
  // Only the server can verify that the token was signed with our secret.
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res
      .status(401)
      .json({ message: "Your session expired. Please log in again." });
  }
  try {
    const user = await User.findById(payload.id);
    // Deleted accounts and older token versions must not regain access.
    if (!user || (payload.version || 0) !== user.tokenVersion) {
      return res.status(401).json({ message: "Please log in again" });
    }
    req.user = { id: user.id };
    req.account = user;
    next();
  } catch {
    res.status(500).json({ message: "Unable to verify your session" });
  }
};
