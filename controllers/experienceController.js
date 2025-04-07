const Experience = require("../model/experience");

// POST: Add new experience
const addExperience = async (req, res) => {
  try {
    const experience = new Experience(req.body);
    await experience.save();
    res.status(201).json({ message: "Experience added successfully", experience });
  } catch (error) {
    res.status(500).json({ message: "Error adding experience", error });
  }
};

// GET: All experiences
const getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find();
    res.status(200).json(experiences);
  } catch (error) {
    res.status(500).json({ message: "Error fetching experiences", error });
  }
};

// GET: Single experience by ID
const getExperienceById = async (req, res) => {
    try {
      const experience = await Experience.findById(req.params.id);
      if (!experience) {
        return res.status(404).json({ message: "Experience not found" });
      }
      res.status(200).json(experience);
    } catch (error) {
      res.status(500).json({ message: "Error fetching experience", error });
    }
  };
  

  module.exports = {
    addExperience,
    getExperiences,
    getExperienceById,
  };
  