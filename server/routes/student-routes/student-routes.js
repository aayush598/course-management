const express = require("express");


const router = express.Router();

router.get("/get/:studentId", getCoursesByStudentId);

module.exports = router;
