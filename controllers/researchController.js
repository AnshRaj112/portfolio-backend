const Research = require("../model/Research");

const getResearch = async (req, res) => {
  try {
    const research = await Research.find();
    res.status(200).json(research);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch research papers" });
  }
};

const postResearch = async (req, res) => {
  try {
    const newPaper = new Research(req.body);
    await newPaper.save();
    res.status(201).json(newPaper);
  } catch (err) {
    res.status(500).json({ message: "Failed to add research paper" });
  }
};

module.exports = { getResearch, postResearch };
