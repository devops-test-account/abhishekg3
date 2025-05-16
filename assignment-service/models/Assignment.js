const mongoose = require("mongoose");
Schema = mongoose.Schema;
var taskSchema = Schema({
  title: String,
  description: String,
  startDate: String,
});

var userSchema = Schema({
  username: String,
  password: String,
});

const assignmentSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
    },
  createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true 
      },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
 
});
var Task = mongoose.model("Task", taskSchema);
var User = mongoose.model("User", userSchema);
module.exports = mongoose.model("Assignment", assignmentSchema);
