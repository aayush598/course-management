const express = require("express");
const {
  getCurrentCourseProgress,
  markCurrentLectureAsViewed,
  resetCurrentCourseProgress,
  getCertificate,
} = require("../../controllers/student-controller/course-progress-controller");

const router = express.Router();

router.get("/get/:userId/:courseId", getCurrentCourseProgress);
router.post("/mark-lecture-viewed", markCurrentLectureAsViewed);
router.post("/reset-progress", resetCurrentCourseProgress);
router.post("/get/certificate", getCertificate);


module.exports = router;
