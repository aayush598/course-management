import axiosInstance from "@/api/axiosInstance";

export async function registerService(formData) {
  const { data } = await axiosInstance.post("/auth/register", {
    ...formData,
    role: "user",
  });

  return data;
}

export async function loginService(formData) {
  const { data } = await axiosInstance.post("/auth/login", formData);

  return data;
}

export async function checkAuthService() {
  const { data } = await axiosInstance.get("/auth/check-auth");

  return data;
}

export async function mediaUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
  });

  return data;
}

export async function mediaDeleteService(id) {
  const { data } = await axiosInstance.delete(`/media/delete/${id}`);

  return data;
}

export async function fetchInstructorCourseListService() {
  const { data } = await axiosInstance.get(`/instructor/course/get`);

  return data;
}

export async function addNewCourseService(formData) {
  const { data } = await axiosInstance.post(`/instructor/course/add`, formData);

  return data;
}
export async function fetchInstructorCourseDetailsService(id) {
  try {
    console.log("client\src\services\index.js")
    const token = JSON.parse(sessionStorage.getItem("accessToken")) || null;
    const user = JSON.parse(sessionStorage.getItem("authUser")) || null;
    const userId = user?._id || null;
    console.log(`index instructor Token: ${token} | User: ${user} | UserId: ${userId}`);

    let url = `/instructor/course/get/details/${id}`;
    if (userId) {
      url += `?userId=${userId}`;
    }

    // Avoid making an API call if the ID is missing
    if (!id) {
      console.error("fetchInstructorCourseDetailsService called with invalid ID");
      return { success: false, message: "Invalid Course ID" };
    }

    const { data } = await axiosInstance.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    console.log(`Fetched Instructor Course Details:`, data);
    return data;
  } catch (error) {
    console.error("Error fetching instructor course details:", error);
    throw error;
  }
}

export async function updateCourseByIdService(id, formData) {
  try {
    const token = JSON.parse(sessionStorage.getItem("accessToken")) || null;
    const user = JSON.parse(sessionStorage.getItem("authUser")) || null;
    const userId = user?._id || null;
    console.log(`Token: ${token} | User: ${user} | UserId: ${userId}`);

    if (!id) {
      console.error("updateCourseByIdService called with invalid ID");
      return { success: false, message: "Invalid Course ID" };
    }

    const { data } = await axiosInstance.put(`/instructor/course/update/${id}`, formData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    console.log(`Course Updated: ${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
}

export async function mediaBulkUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/bulk-upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
  });

  return data;
}

export async function fetchStudentViewCourseListService(query = "") {
  try {
    const token = JSON.parse(sessionStorage.getItem("accessToken")) || null;
    const user = JSON.parse(sessionStorage.getItem("authUser")) || null;
    const userId = user?._id || null;
    console.log(`toke : ${token} | user : ${user} | userId : ${userId}`);

    let finalQuery = query;
    if (userId) {
      finalQuery = query ? `${query}&userId=${userId}` : `userId=${userId}`;
    }

    // Avoid making an API call with undefined query parameters
    if (!finalQuery) {
      console.error("fetchStudentViewCourseListService called with empty query");
      return { success: false, data: [] };
    }

    const { data } = await axiosInstance.get(`/student/course/get?${finalQuery}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    console.log(`Fetch Course Query: ${finalQuery}`); // Debugging
    return data;
  } catch (error) {
    console.error("Error fetching student courses:", error);
    throw error;
  }
}


export async function fetchStudentViewCourseDetailsService(courseId) {
  try {
    const token = JSON.parse(sessionStorage.getItem("accessToken")) || null;
    const user = JSON.parse(sessionStorage.getItem("authUser")) || null;
    const userId = user?._id || null;

    if (!courseId) {
      console.error("fetchStudentViewCourseDetailsService: Missing courseId");
      return { success: false, message: "Invalid Course ID" };
    }

    if (!userId) {
      console.error("fetchStudentViewCourseDetailsService: Missing userId");
    }

    const url = `/student/course/get/details/${courseId}?userId=${userId}`;
    
    console.log(`Fetching Course Details - courseId: ${courseId}, userId: ${userId}`);

    const { data } = await axiosInstance.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    console.log("Fetched Course Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching student course details:", error);
    throw error;
  }
}


export async function fetchPopularCoursesService() {
  const { data } = await axiosInstance.get(`/student/course/get/popular-courses` , { 
    limit : 5
  });

  return data;
}

export async function fetchSimilarCoursesService(courseId , limit) {
  const { data } = await axiosInstance.get(`/student/course/get/similiar-cources${courseId}/${limit}`);

  return data;
}

export async function fetchExplorePageRecommendationsService(userId) {
  const { data } = await axiosInstance.get(`/student/course/get/recommendations/${userId}`);

  return data;
}

export async function recordUserInterectionService(interectioData) {
  console.log(`Interection Data: ${JSON.stringify(interectioData)}`);
  const { data } = await axiosInstance.post(`/student/course/record-interection`, interectioData );

  return data;
}


export async function checkCoursePurchaseInfoService(courseId, studentId) {
  const { data } = await axiosInstance.get(
    `/student/course/purchase-info/${courseId}/${studentId}`
  );

  return data;
}

export async function createPaymentService(formData) {
  const { data } = await axiosInstance.post(`/student/order/create`, formData);

  return data;
}

export async function getFreeCourseService(data){
  const {CourseData} = await axiosInstance.post(`/student/order/free`, data);
  return CourseData;
}

export async function captureAndFinalizePaymentService(
  paymentId,
  payerId,
  orderId
) {
  const { data } = await axiosInstance.post(`/student/order/capture`, {
    paymentId,
    payerId,
    orderId,
  });

  return data;
}

export async function fetchStudentBoughtCoursesService(studentId) {
  const { data } = await axiosInstance.get(
    `/student/courses-bought/get/${studentId}`
  );

  return data;
}

export async function getCurrentCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.get(
    `/student/course-progress/get/${userId}/${courseId}`
  );

  return data;
}

export async function markLectureAsViewedService(userId, courseId, lectureId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/mark-lecture-viewed`,
    {
      userId,
      courseId,
      lectureId,
    }
  );

  return data;
}

export async function resetCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/reset-progress`,
    {
      userId,
      courseId,
    }
  );

  return data;
}

export const getCertificateService = async (data) => {
  try {
    const response = await axiosInstance.post('/student/course-progress/get/certificate', data, {
      responseType: 'arraybuffer',  // Important for receiving binary data
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // The PDF buffer will be in response.data
    return response.data;
  } catch (error) {
    console.error('Error getting certificate:', error);
    throw error;
  }
};

export async function getContactListService() {
  const { data } = await axiosInstance.get(`/chat/get/contact-list`);
  return data;
}

export async function getMessageService(senderId) {
  const { data } = await axiosInstance.get(`/chat/get/message/${senderId}`);
  return data;
}

export async function updateQuizMarksService(formData) {
  const { data } = await axiosInstance.post(`/quiz/update-quiz-marks`, formData);

  return data;
}

export async function getQuizMarksService(studentId, lectureId) {
  const { data } = await axiosInstance.get(`/quiz/get-quiz-marks/${studentId}/${lectureId}`);

  return data;
}

export async function getLeaderboardService() {
  const { data } = await axiosInstance.get(`/quiz/get/leaderboard`);

  return data;
}