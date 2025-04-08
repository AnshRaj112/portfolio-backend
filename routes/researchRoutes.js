const express = require("express");
const router = express.Router();
const { getResearch, postResearch } = require("../controllers/researchController");

router.get("/", getResearch);
router.post("/", postResearch);

module.exports = router;
