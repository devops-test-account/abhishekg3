const express = require("express");
const Assignment = require("../models/Assignment");
const jwt = require("jsonwebtoken");
const router = express.Router();


// Middleware for authenticating token and retrieving user
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  
  try {
    // Verify the token and decode it
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
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// Create a new assignment
router.post("/", authenticateToken, async (req, res) => {
  const { taskId, userId } = req.body;   
  const createdBy = req.userId; 
  if (req.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  try {
    const newAssignment = new Assignment({ taskId, userId, createdBy });
    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all assignments
router.get("/", authenticateToken, async (req, res) => {
  try {    
        const userRole = req.role;
        const userId = req.userId;

        if (userRole !== "admin") {
          const assignments = await Assignment.find({ userId: userId })
            .populate("taskId", "title")
            .populate("userId", "username");
          res.json(assignments);
        } else {
          const allAssignments = await Assignment.find()
            .populate("taskId", "title")
            .populate("userId", "username");
          res.json(allAssignments);
        }   


  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get assignment by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    const assignment = await Assignment.findById(req.params.id)
      .populate("taskId", "title")
      .populate("userId", "username");
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update assignment
router.put("/:id", authenticateToken, async (req, res) => {
  const { taskId, userId } = req.body;
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { taskId, userId },
      { new: true }
    );
    if (!updatedAssignment)
      return res.status(404).json({ message: "Assignment not found" });
    res.json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete assignment
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!deletedAssignment)
      return res.status(404).json({ message: "Assignment not found" });
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
