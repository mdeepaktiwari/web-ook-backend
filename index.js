const http = require("http");
const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 8000;
const models = require("./models");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: true,
  },
});
const userSocketMap = new Map();
module.exports = { io, userSocketMap };
const routes = require("./routes");

io.on("connection", (socket) => {
  socket.on("save-user", (data) => {
    try {
      const userObj = jwt.verify(data.token, process.env.JWT_SECRET);
      userSocketMap.set(userObj.userId, socket.id);
      console.log(
        `[INFO]: New user connected with ID: ${userObj.userId} ${socket.id}`
      );
    } catch (error) {
      console.error("[ERROR]: Error verifying token or saving user:", error);
      socket.emit("error", { message: "Authentication failed" });
    }
  });

  socket.on("disconnect", () => {
    userSocketMap.forEach((value, key) => {
      if (value === socket.id) {
        userSocketMap.delete(key);
        console.log(`[INFO]: User ${key} disconnected`);
      }
    });
  });
});
app.use(cors());
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("[INFO]: Database connected successfully"))
  .catch((err) => console.error("[ERROR]:Database connection error:", err));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  "/",
  (req, res, next) => {
    console.log(`[INFO]: Request received at route ${req.url}`);
    next();
  },
  routes
);

server.listen(PORT, () => {
  console.log(`[INFO]: Server is running on port ${PORT}`);
});
