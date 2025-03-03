const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");
const User = require("../../models/User");


const getAllStudentViewCourses = async (req, res) => {
  try {
    console.log("req.query", req.query.userId);
    const {
      category = [],
      level = [],
      primaryLanguage = [],
      sortBy = "price-lowtohigh",
    } = req.query;
    const userId = req.query.userId;

    //console.log(req.query, "req.query");

    let filters = {};
    if (category.length) {
      filters.category = { $in: category.split(",") };
    }
    if (level.length) {
      filters.level = { $in: level.split(",") };
    }
    if (primaryLanguage.length) {
      filters.primaryLanguage = { $in: primaryLanguage.split(",") };
    }

    let sortParam = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sortParam.pricing = 1;
        break;
      case "price-hightolow":
        sortParam.pricing = -1;
        break;
      case "title-atoz":
        sortParam.title = 1;
        break;
      case "title-ztoa":
        sortParam.title = -1;
        break;
      default:
        sortParam.pricing = 1;
        break;
    }

    // Fetch all courses based on filters
    const coursesList = await Course.find(filters).sort(sortParam);

    let discount = 0;
    
    console.log(`userId : ${userId}`);
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.referredBy) {
        discount = 0.1; // 10% discount if registered with a referral code
      }
      console.log(`user : ${user} | referredBy : ${user?.referredBy}`);
    }

    // Apply discount to each course
    const updatedCourses = coursesList.map((course) => ({
      ...course.toObject(),
      pricing: course.pricing * (1 - discount),
    }));

    res.status(200).json({
      success: true,
      data: updatedCourses,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching courses.",
    });
  }
};

const getStudentViewCourseDetails = async (req, res) => {
  try {
    console.log("Received request for course details:", req.params, req.query);
    
    const { id } = req.params;
    const { userId } = req.query; // ✅ Ensure we extract userId from query params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const courseDetails = await Course.findById(id);
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "No course details found",
        data: null,
      });
    }

    let discount = 0;
    if (userId) {
      const user = await User.findById(userId);
      if (user?.referredBy) {
        discount = 0.1; // ✅ Apply 10% discount if referred
        console.log(`User referred by: ${user.referredBy}, applying discount.`);
      }
    }

    const discountedPrice = courseDetails.pricing * (1 - discount);
    console.log(`Original Price: ${courseDetails.pricing}, Discounted Price: ${discountedPrice}`);

    res.status(200).json({
      success: true,
      data: { ...courseDetails.toObject(), pricing: discountedPrice },
    });
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching course details.",
    });
  }
};



const checkCoursePurchaseInfo = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    // Validate IDs
    if (!id || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID or student ID",
      });
    }

    const studentCourses = await StudentCourses.findOne({ userId: studentId });

    // If studentCourses is null, the student hasn't purchased any course
    if (!studentCourses) {
      return res.status(200).json({
        success: true,
        data: false,
        message: "Student has not purchased any courses.",
      });
    }

    // Ensure courses array exists
    if (!studentCourses.courses || studentCourses.courses.length === 0) {
      return res.status(200).json({
        success: true,
        data: false,
        message: "No purchased courses found for this student.",
      });
    }

    // Check if the student has purchased the specific course
    const hasPurchased = studentCourses.courses.some(
      (item) => item.courseId.toString() === id
    );

    res.status(200).json({
      success: true,
      data: hasPurchased,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while checking course purchase information.",
    });
  }
};

module.exports = {
  getAllStudentViewCourses,
  getStudentViewCourseDetails,
  checkCoursePurchaseInfo,
};
