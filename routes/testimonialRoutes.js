const express = require("express");
const router = express.Router();
const { getTestimonials, postTestimonial } = require("../controllers/testimonialController");

router.get("/", getTestimonials);
router.post("/", postTestimonial);

module.exports = router;
