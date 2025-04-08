const Certification = require("../model/Certification");

// @desc  Get all certifications
const getCertifications = async (req, res) => {
  try {
    const certifications = await Certification.find();
    res.status(200).json(certifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch certifications", error });
  }
};

// @desc  Post a new certification
const postCertification = async (req, res) => {
  const { name, provider, credentialLink, image } = req.body;

  try {
    const newCertification = new Certification({
      name,
      provider,
      credentialLink,
      image,
    });
    await newCertification.save();
    res
      .status(201)
      .json({
        message: "Certification added successfully",
        certification: newCertification,
      });
  } catch (error) {
    res.status(500).json({ message: "Failed to add certification", error });
  }
};

module.exports = {
  getCertifications,
  postCertification,
};
