const express = require("express");
const {
  createOrder,
  capturePaymentAndFinalizeOrder,
  addCourseForFree
} = require("../../controllers/student-controller/order-controller");

const router = express.Router();

router.post("/create", createOrder);
router.post("/capture", capturePaymentAndFinalizeOrder);
router.post("/free", addCourseForFree)

module.exports = router;
