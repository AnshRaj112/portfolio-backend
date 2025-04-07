const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
  post: { type: String, required: true },
  company: { type: String, required: true },
  duration: { type: String, required: true },
  roleHistory: { type: String },
  companyUrl: { type: String },
  logoUrl: { type: String },
  location: { type: String },
  overview: { type: String },
  achievements: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Experience", experienceSchema);
