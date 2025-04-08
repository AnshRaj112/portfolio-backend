const mongoose = require("mongoose");

const CertificationSchema = new mongoose.Schema({
  image: String,
  courseName: String,
  provider: String,
  credentialLink: String,
});

module.exports = mongoose.model("Certification", CertificationSchema);
