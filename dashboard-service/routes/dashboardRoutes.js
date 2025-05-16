const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();

// Middleware for authenticating token and retrieving user
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];  
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  
  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
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
// Get dashboard data
router.get("/", authenticateToken, async (req, res) => {
  try {
  
    const token = req.headers.authorization;
    const [users, tasks, assignments] = await Promise.all([
      axios.get(process.env.TASK_SERVICE_URL, {
        headers: { Authorization: token },
      }),
      axios.get(process.env.ASSIGNMENT_SERVICE_URL, {
        headers: { Authorization: token },
      }),
      axios.get(process.env.USER_SERVICE_URL, {
        headers: { Authorization: token },
      }),
    ]);
    let tasksCount = Array.isArray(tasks.data)
      ? tasks.data.length
      : Object.keys(tasks.data).length;
    let assignmentsCount = Array.isArray(assignments.data)
      ? assignments.data.length
      : Object.keys(assignments.data).length;
    let usersCount = Array.isArray(users.data)
      ? users.data.length
      : Object.keys(users.data).length;
    const dashboardData = {
      tasks: tasksCount,
      assignments: assignmentsCount,
      users: usersCount,
    };
    res.json(dashboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching dashboard data" });
  }
});


module.exports = router;
