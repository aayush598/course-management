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
  const { data } = await axiosInstance.get(
    `/instructor/course/get/details/${id}`
  );

  return data;
}

export async function updateCourseByIdService(id, formData) {
  const { data } = await axiosInstance.put(
    `/instructor/course/update/${id}`,
    formData
  );

  return data;
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

export async function fetchStudentViewCourseListService(query) {
  const { data } = await axiosInstance.get(`/student/course/get?${query}`);

  return data;
}

export async function fetchStudentViewCourseDetailsService(courseId) {
  const { data } = await axiosInstance.get(
    `/student/course/get/details/${courseId}`
  );

  return data;
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