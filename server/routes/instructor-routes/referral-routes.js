const express = require("express");
const User = require("../../models/User");
const router = express.Router();

// Get referrals for an instructor
router.get("/:instructorId", async (req, res) => {
  try {
    const instructor = await User.findById(req.params.instructorId).populate("referrals", "userName userEmail");

    if (!instructor) {
      return res.status(404).json({ success: false, message: "Instructor not found" });
    }

    res.json({
      success: true,
      referralCode: instructor.referralCode,
      referralCount: instructor.referralCount,
      referrals: instructor.referrals, // Sends list of referred users
    });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
