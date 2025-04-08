const express = require("express");
const router = express.Router();
const { getSkills, postSkill } = require("../controllers/skillController.js");

router.get("/", getSkills);
router.post("/", postSkill);

module.exports = router;
