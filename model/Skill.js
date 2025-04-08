const mongoose = require("mongoose");

const SkillSchema = new mongoose.Schema({
  name: String,
  image: String, // Store image URL
});

module.exports = mongoose.model("Skill", SkillSchema);
