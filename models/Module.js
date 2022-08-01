const mongoose = require("mongoose");
const User = require("./User");
const ModuleSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true,
  },
  moduleCode: {
    type: String,
    required: true,
  },
  learningUnits: {
    type: Number,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  lecturer: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "User",
  },
});

const Module = mongoose.model("Module", ModuleSchema);

module.exports = Module;
