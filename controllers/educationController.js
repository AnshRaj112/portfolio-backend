const Education = require("../model/Education");

const getAllEducation = async (req, res) => {
  try {
    const education = await Education.find();
    res.status(200).json(education);
  } catch (err) {
    res.status(500).json({ message: "Error fetching education", error: err });
  }
};

const addEducation = async (req, res) => {
  const newEdu = new Education(req.body);
  try {
    await newEdu.save();
    res.status(201).json(newEdu);
  } catch (err) {
    res.status(500).json({ message: "Error adding education", error: err });
  }
};

module.exports = { getAllEducation, addEducation };
