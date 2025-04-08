const express = require("express");
const router = express.Router();
const { addProject, getProjects, getProjectById } = require("../controllers/projectController");

router.post("/", addProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);

module.exports = router;
