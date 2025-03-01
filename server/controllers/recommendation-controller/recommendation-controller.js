const { default: mongoose } = require("mongoose");
const UserInteraction = require("../../models/interaction.js");
const UserPreference = require("../../models/prefrence.js");

// Function to record user interactions
async function recordUserInteraction(req, res) {
  const { userId, courseId, interactionType, additionalData = {} } = req.body;
  try {
    const interaction = new UserInteraction({
      userId,
      courseId,
      interactionType,
      ...additionalData,
    });

    await interaction.save();

    // Update user preferences based on this interaction
    await updateUserPreferences(userId);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error recording user interaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record user interaction",
      error: error.message,
    });
  }
}

// Function to update user preferences based on their interactions
async function updateUserPreferences(userId) {
  try {
    // Get recent user interactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const interactions = await UserInteraction.find({
      userId,
      timestamp: { $gte: thirtyDaysAgo },
    }).sort({ timestamp: -1 });

    if (interactions.length === 0) {
      return;
    }

    // Get courses related to these interactions
    const courseIds = [...new Set(interactions.map((i) => i.courseId))];
    const courses = await mongoose.model("Course").find({
      _id: { $in: courseIds },
    });

    // Calculate category preferences
    const categoryCount = {};
    const levelCount = {};
    const languageCount = {};

    // Weight different interaction types
    const weights = {
      enroll: 5,
      complete: 10,
      favorite: 4,
      view: 1,
      search: 2,
    };

    interactions.forEach((interaction) => {
      const course = courses.find(
        (c) => c._id.toString() === interaction.courseId
      );
      if (!course) return;

      const weight = weights[interaction.interactionType] || 1;

      // Update category counts
      if (course.category) {
        categoryCount[course.category] =
          (categoryCount[course.category] || 0) + weight;
      }

      // Update level counts
      if (course.level) {
        levelCount[course.level] = (levelCount[course.level] || 0) + weight;
      }

      // Update language counts
      if (course.primaryLanguage) {
        languageCount[course.primaryLanguage] =
          (languageCount[course.primaryLanguage] || 0) + weight;
      }
    });

    // Normalize weights to be between 0-1
    const normalizeWeights = (countObj) => {
      const total = Object.values(countObj).reduce(
        (sum, count) => sum + count,
        0
      );
      if (total === 0) return {};

      return Object.entries(countObj).reduce((acc, [key, count]) => {
        acc[key] = count / total;
        return acc;
      }, {});
    };

    const normalizedCategories = normalizeWeights(categoryCount);
    const normalizedLevels = normalizeWeights(levelCount);
    const normalizedLanguages = normalizeWeights(languageCount);

    // Update or create user preferences
    await UserPreference.findOneAndUpdate(
      { userId },
      {
        preferredCategories: Object.entries(normalizedCategories).map(
          ([category, weight]) => ({ category, weight })
        ),
        preferredLevels: Object.entries(normalizedLevels).map(
          ([level, weight]) => ({ level, weight })
        ),
        preferredLanguages: Object.entries(normalizedLanguages).map(
          ([language, weight]) => ({ language, weight })
        ),
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return { success: false, error: error.message };
  }
}

// Function to get personalized course recommendations
async function getRecommendedCourses(userId, limit = 10) {
  try {
    // Get user preferences
    const userPreferences = await UserPreference.findOne({ userId });

    // If no preferences yet, return popular courses
    if (!userPreferences) {
      return popularCourses(limit);
    }

    // Get all published courses
    const Course = mongoose.model("Course");
    const allCourses = await Course.find({ isPublised: true });

    // Calculate a score for each course based on user preferences
    const coursesWithScores = allCourses.map((course) => {
      let score = 0;

      // Category match
      const categoryPref = userPreferences.preferredCategories.find(
        (p) => p.category === course.category
      );
      if (categoryPref) {
        score += categoryPref.weight * 0.5; // 50% weight for category
      }

      // Level match
      const levelPref = userPreferences.preferredLevels.find(
        (p) => p.level === course.level
      );
      if (levelPref) {
        score += levelPref.weight * 0.3; // 30% weight for level
      }

      // Language match
      const languagePref = userPreferences.preferredLanguages.find(
        (p) => p.language === course.primaryLanguage
      );
      if (languagePref) {
        score += languagePref.weight * 0.2; // 20% weight for language
      }

      return {
        course,
        score,
      };
    });

    // Sort by score (highest first) and take the top 'limit' courses
    const recommendations = coursesWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.course);

    return recommendations;
  } catch (error) {
    console.error("Error getting course recommendations:", error);
    return [];
  }
}

// Function to get popular courses (fallback for new users)
async function popularCourses(limit = 10) {
  try {
    // Count enrollments per course
    const enrollmentCounts = await UserInteraction.aggregate([
      { $match: { interactionType: "enroll" } },
      { $group: { _id: "$courseId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    // Get course details
    const Course = mongoose.model("Course");
    const courseIds = enrollmentCounts.map((item) => item._id);
    const courses = await Course.find({
      _id: { $in: courseIds },
      isPublised: true,
    });

    // Sort courses by their enrollment count
    return courses.sort((a, b) => {
      const aCount =
        enrollmentCounts.find(
          (item) => item._id.toString() === a._id.toString()
        )?.count || 0;
      const bCount =
        enrollmentCounts.find(
          (item) => item._id.toString() === b._id.toString()
        )?.count || 0;
      return bCount - aCount;
    });
  } catch (error) {
    console.error("Error getting popular courses:", error);
    return [];
  }
}

// Function to get similar courses to a specific course
async function getSimilarCourses(req, res) {
  const { courseId, limit = 5 } = req.params;

  try {
    const Course = mongoose.model("Course");
    const course = await Course.findById(courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    // Find courses with the same category and level
    const similarCourses = await Course.find({
      _id: { $ne: courseId }, // Exclude the current course
      isPublised: true,
      $or: [
        { category: course.category },
        { level: course.level },
        { primaryLanguage: course.primaryLanguage },
      ],
    }).limit(limit * 2); // Get more than we need for better filtering

    // Score similarity
    const coursesWithScores = similarCourses.map((similarCourse) => {
      let score = 0;

      // Same category: +3 points
      if (similarCourse.category === course.category) {
        score += 3;
      }

      // Same level: +2 points
      if (similarCourse.level === course.level) {
        score += 2;
      }

      // Same language: +1 point
      if (similarCourse.primaryLanguage === course.primaryLanguage) {
        score += 1;
      }

      return {
        course: similarCourse,
        score,
      };
    });

    // Sort by score and take top 'limit'
    const updateCourse = coursesWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.course);

    res.status(200).json({
      success: true,
      data: updateCourse,
    });
  } catch (error) {
    console.error("Error getting similar courses:", error);
    res.status(500).json({
      success: false,
      message: "Error getting similar courses",
      data: [],
    });
  }
}

// API endpoint for explore page
async function getExplorePageRecommendations(req, res) {
  const { userId } = req.params;
  try {
    const recommendations = {
      recommended: await getRecommendedCourses(userId, 8),
      popular: await popularCourses(8),
      recentlyViewed: [],
    };

    // Get recently viewed courses
    if (userId) {
      const recentViews = await UserInteraction.find({
        userId,
        interactionType: "view",
      })
        .sort({ timestamp: -1 })
        .limit(5);

      if (recentViews.length > 0) {
        const Course = mongoose.model("Course");
        const courseIds = recentViews.map((view) => view.courseId);
        recommendations.recentlyViewed = await Course.find({
          _id: { $in: courseIds },
          isPublised: true,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Error getting explore page recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Error getting recommendations",
      data: [],
    });
  }
}

const getPopularCourses = async (req, res) => {
  try {
    const { limit = 10 } = req.body;
    console.log(req.body);

    const popularCourse = await popularCourses(limit);
    res.status(200).json({
      success: true,
      data: popularCourse,
    });
  } catch (error) {
    console.error("Error getting popular courses:", error);
    res.status(500).json({
      success: false,
      message: "Error getting popular courses",
      data: [],
    });
  }
};

module.exports = {
  recordUserInteraction,
  getRecommendedCourses,
  getPopularCourses,
  getSimilarCourses,
  getExplorePageRecommendations,
};
