const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Register user
router.post("/register", async (req, res) => {
  const { name, password, email, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, password: hashedPassword,email,role });    
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.status !== 1) {
      return res.status(403).json({ message: "Your account is not activated" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" }); 
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware for authenticating token and retrieving user
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  try {   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; 
    req.role = decoded.role;
    next(); 
  } catch (error) {   
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};



// Get user profile
router.get("/profile",authenticateToken, async (req, res) => {
  try {    
    let userId = req.userId;   
    let userRole = req.role; 
    let user = await User.findById(userId, "-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (userRole !== "admin") {     
      res.json(user);
    } else {
      const allUsers = await User.find().select("-password");
      res.json(allUsers);
    }  
   
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", authenticateToken,async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "No users found",
        status: "empty",
      });
    }

    res.status(200).json({
      message: "Users retrieved successfully",
      count: users.length,
      users: users,
      email: users.email
    });
  } catch (error) {
    console.error("Error in users route:", error);

    res.status(500).json({
      message: "Server error retrieving users",
      error: error.message,
      stack: error.stack,
    });
  }
});

router.put("/update-profile",authenticateToken, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    const { id, username, email, firstName, lastName } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        username: username ? username.trim() : undefined,
        email: email ? email.toLowerCase().trim() : undefined,
        firstName: firstName ? firstName.trim() : undefined,
        lastName: lastName ? lastName.trim() : undefined,
      },
      { new: true }
    );

    if (updatedUser) {
      res.status(200).send({
        message: "User updated successfully",
        user: updatedUser,
      });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error updating User" });
  }
});

router.delete("/delete-user/:id",authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (deletedUser) {
      res.status(200).send({
        message: "User deleted successfully",
        user: deletedUser,
      });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Error deleting User",
      error: err.message,
    });
  }
});
module.exports = router;
