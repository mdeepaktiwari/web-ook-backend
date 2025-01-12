const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  let token = req.header("Authorization") || "";
  token = token.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    console.log(`[ERROR]: Error in auth middleware: ${err}`);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
