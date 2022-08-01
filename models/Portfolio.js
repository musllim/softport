const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true,
  },
  moduleCode: {
    type: String,
    required: true,
  },
  doc: {
    type: String,
    required: true,
  },
  learningUnit: {
    type: Number,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  decision: String,
  date: {
    type: Date,
    default: Date.now,
  },
  owner: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: "User" },
  module: { type: mongoose.SchemaTypes.ObjectId, ref: "Module" },
});

const Portfolio = mongoose.model("Portfolio", PortfolioSchema);

module.exports = Portfolio;
