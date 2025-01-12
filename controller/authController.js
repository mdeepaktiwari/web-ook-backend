const User = require("../models/user"); // Adjust the path as necessary
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!password || !email || !name) {
      return res.status(400).json({ message: "Empty fields" });
    }
    const existingUser = await User.find({ email });
    if (existingUser?.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const userObject = user.toObject();
    delete userObject.password;
    return res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        name: userObject.name,
        email: userObject.email,
      },
    });
  } catch (error) {
    console.log(`[ERROR]: Error in signup: ${error}`);
    res.status(500).json({ message: "Error creating user" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!password || !email) {
      return res.status(400).json({ message: "Empty fields" });
    }
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) return res.status(404).json({ message: "User not found" });
    const userObject = user.toObject();
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid username or password" });
    // create a jwt token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    delete userObject.password;
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: userObject.name,
        email: userObject.email,
      },
    });
  } catch (error) {
    console.log(`[ERROR]: Error in login: ${error}`);
    return res.status(500).json({ message: "Error in logging" });
  }
};
