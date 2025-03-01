const express = require("express");
const {
  getStudentViewCourseDetails,
  getAllStudentViewCourses,
  checkCoursePurchaseInfo,
} = require("../../controllers/student-controller/course-controller");
const authenticate = require("../../middleware/auth-middleware");
const {
  getExplorePageRecommendations,
  getSimilarCourses,
  getPopularCourses,
  recordUserInteraction
} = require("../../controllers/recommendation-controller/recommendation-controller");
const router = express.Router();

router.get("/get", getAllStudentViewCourses);
router.get("/get/details/:id", getStudentViewCourseDetails);
router.get("/purchase-info/:id/:studentId", checkCoursePurchaseInfo);
router.get("/get/recommendations/:userId", authenticate, getExplorePageRecommendations);
router.get("/get/similiar-cources/:courseId/:limit", getSimilarCourses);
router.get("/get/popular-courses", getPopularCourses);
router.post("/record-interection" , recordUserInteraction );

module.exports = router;
