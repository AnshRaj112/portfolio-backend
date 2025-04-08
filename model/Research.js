const mongoose = require("mongoose");

const ResearchSchema = new mongoose.Schema({
  title: String,
  coverImage: String,
  paperLink: String,
});

module.exports = mongoose.model("Research", ResearchSchema);
