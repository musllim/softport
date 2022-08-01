const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  classesToTeach: [Number],
  regNo: String,
  departmentOPtion: String,
  permission: String,
  year: {
    type: Number,
    default: 1,
  },
  avatar: String,
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
