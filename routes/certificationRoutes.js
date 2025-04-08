const express = require("express");
const router = express.Router();
const { getCertifications, postCertification } = require("../controllers/certificationController");

router.get("/", getCertifications);
router.post("/", postCertification);

module.exports = router;
