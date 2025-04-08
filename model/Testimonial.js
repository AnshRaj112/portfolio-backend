const mongoose = require("mongoose");

const TestimonialSchema = new mongoose.Schema({
  message: String,
  name: String,
  position: String
});

module.exports = mongoose.model("Testimonial", TestimonialSchema);
