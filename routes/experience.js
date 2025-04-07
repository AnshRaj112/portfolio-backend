const express = require("express");
const router = express.Router();
const { addExperience, getExperiences, getExperienceById } = require("../controllers/experienceController");

// POST route
router.post("/", addExperience);

// GET route
router.get("/", getExperiences);

router.get("/:id", getExperienceById);

module.exports = router;
