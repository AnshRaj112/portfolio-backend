const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  duration: String,
  location: String,
  subjects: [String],
});

const Education = mongoose.model("Education", educationSchema);

module.exports = Education;
