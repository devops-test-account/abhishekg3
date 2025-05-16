const express = require("express");
const Notification = require("../models/Notification");
const nodemailer = require("nodemailer");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const axios = require("axios");

// Setup Nodemailer transport
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});
// Create a new notification
router.post("/", async (req, res) => {
  const { userId, message } = req.body;
  const token = req.headers.authorization; 

  const email = await fetchUserEmail(userId, token); 
  if (!email) {
    return res.status(404).json({ error: "User email not found" });
  }
  try {
    const newNotification = new Notification({ userId, message });
    await newNotification.save();
    // Send email notification
    const mailOptions = {
      from: process.env.MAILTRAP_USER_ID,
      to: email,
      subject: "New Notification",
      text: message,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: "Failed to send email" });
      }
      res.status(201).json(newNotification);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Updated fetchUserEmail function
const fetchUserEmail = async (userId, token) => {
  try {
    const response = await axios.get(process.env.USER_SERVICE_URL, {
      headers: { Authorization: token }, 
    }); 
    // Find the user with the matching ID
    const user = response.data.users.find((user) => user._id === userId);
    if (user) {
      return user.email;
    } else {
      console.error("User not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user email", error);
    return null;
  }
};

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

// Get all notifications for a user
router.get("/:userId",authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId,
    });   
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put("/:id/read",authenticateToken, async (req, res) => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!updatedNotification)
      return res.status(404).json({ message: "Notification not found" });
    res.json(updatedNotification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete("/:id",authenticateToken, async (req, res) => {
  try {
    const deletedNotification = await Notification.findByIdAndDelete(
      req.params.id
    );
    if (!deletedNotification)
      return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





module.exports = router;
