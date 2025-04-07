const express = require("express");
const { getAllEducation, addEducation } = require ("../controllers/educationController.js");

const router = express.Router();

router.get("/", getAllEducation);
router.post("/", addEducation);

module.exports = router;
