// server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;

// Proxy for user-service
app.use(
  "/users",
  createProxyMiddleware({
    target: "http://user-service:3001",
    changeOrigin: true,
    pathRewrite: {
      "^/users": "", // remove /users prefix when forwarding to user-service
    },
  })
);

// Proxy for task-service
app.use(
  "/tasks",
  createProxyMiddleware({
    target: "http://task-service:3002",
    changeOrigin: true,
    pathRewrite: {
      "^/tasks": "", // remove /tasks prefix when forwarding to task-service
    },
  })
);

// Proxy for task-service
app.use(
  "/assignments",
  createProxyMiddleware({
    target: "http://assignment-service:3003",
    changeOrigin: true,
    pathRewrite: {
      "^/assignment": "", // remove /tasks prefix when forwarding to task-service
    },
  })
);

// Proxy for task-service
app.use(
  "/notifications",
  createProxyMiddleware({
    target: "http://notification-service:3004",
    changeOrigin: true,
    pathRewrite: {
      "^/notifications": "", // remove /tasks prefix when forwarding to task-service
    },
  })
);
  
// Proxy for task-service
app.use(
  "/dashboard",
  createProxyMiddleware({
    target: "http://dashboard-service:3005",
    changeOrigin: true,
    pathRewrite: {
      "^/dashboard": "", // remove /tasks prefix when forwarding to task-service
    },
  })
);
  

app.listen(PORT, () => {
  console.log(`API Gateway is running on http://localhost:${PORT}`);
});
