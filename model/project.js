const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: String,
  thumbnail: String,
  description: String,
  techStack: [String],
  images: [String],
  siteUrl: String
});

module.exports = mongoose.model("Project", projectSchema);
