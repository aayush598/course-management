import React, { useContext, useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  MessageCircle,
  Award,
  Sun,
  Moon,
  ChevronRight,
  ChevronLeft,
  Sidebar,
} from "lucide-react";
import VideoPlayer from "@/components/video-player";
import { CourseContent } from "./CourseContent";
import Chat from "@/components/chat/Chat";
import Quiz from "@/pages/student/course-progress/quiz";
import { Certificate } from "./Certificate";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCertificateService,
  getCurrentCourseProgressService,
  markLectureAsViewedService,
  resetCourseProgressService,
} from "@/services";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";

const sampleCourse = {
  id: "1",
  title: "Advanced Python Programming",
  instructor: {
    name: "Dr. Sarah Johnson",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    title: "Senior Software Engineer",
    id: "inst_1",
  },
  description:
    "Master advanced Python concepts including OOP, decorators, and design patterns.",
  progress: 75,
  sections: [
    {
      id: "s1",
      title: "Object-Oriented Programming",
      lectures: [
        {
          id: "l1",
          title: "Classes in Python",
          duration: "15:30",
          videoUrl: "https://example.com/video1.mp4",
          completed: true,
          progressValue: 1,
        },
        {
          id: "l2",
          title: "Inheritance and Polymorphism",
          duration: "12:45",
          videoUrl: "https://example.com/video2.mp4",
          completed: false,
          progressValue: 0,
        },
      ],
    },
  ],
};

function ViewCourse() {
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const { auth } = useContext(AuthContext);
  const { studentCurrentCourseProgress, setStudentCurrentCourseProgress } =
    useContext(StudentContext);

  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const { id } = useParams();

  async function fetchCurrentCourseProgress() {
    const response = await getCurrentCourseProgressService(auth?.user?._id, id);
    if (response?.success) {
      if (!response?.data?.isPurchased) {
        setLockCourse(true);
      } else {
        console.log(response?.data);

        setStudentCurrentCourseProgress({
          courseDetails: response?.data?.courseDetails,
          progress: response?.data?.progress,
        });

        if (response?.data?.completed) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);

          return;
        }

        // Proper logging for production can be added here if needed

        if (response?.data?.progress?.length === 0) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
        } else {
          // Proper logging for production can be added here if needed
          const lastIndexOfViewedAsTrue = response?.data?.progress.reduceRight(
            (acc, obj, index) => {
              return acc === -1 && obj.viewed ? index : acc;
            },
            -1
          );

          setCurrentLecture(
            response?.data?.courseDetails?.curriculum[
              lastIndexOfViewedAsTrue + 1
            ]
          );
        }
      }
    }
  }

  async function updateCourseProgress() {
    if (currentLecture) {
      const response = await markLectureAsViewedService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id,
        currentLecture._id
      );

      if (response?.success) {
        fetchCurrentCourseProgress();
      }
    }
  }

  async function handleRewatchCourse() {
    const response = await resetCourseProgressService(
      auth?.user?._id,
      studentCurrentCourseProgress?.courseDetails?._id
    );

    if (response?.success) {
      setCurrentLecture(null);
      setShowConfetti(false);
      setShowCourseCompleteDialog(false);
      fetchCurrentCourseProgress();
    }
  }

  const handleGetCertificate = async () => {
    try {
      const pdfBuffer = await getCertificateService({
        name: auth?.user?.userName,
        course: studentCurrentCourseProgress?.courseDetails?.title,
        date:
          studentCurrentCourseProgress?.progress?.completionDate ||
          new Date().toLocaleDateString(),
      });

      // Create blob from the arrayBuffer
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "certificate.pdf");
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      // Handle error appropriately
    }
  };

  useEffect(() => {
    fetchCurrentCourseProgress();
  }, [id]);

  useEffect(() => {
    if (currentLecture?.progressValue === 1) updateCourseProgress();
  }, [currentLecture]);

  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);

  //old

  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  // const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  // const [currentLecture, setCurrentLecture] = useState(sampleCourse.sections[0].lectures[0]);
  // const [showCourseCompleteDialog, setShowCourseCompleteDialog] = useState(false);
  // const [showConfetti, setShowConfetti] = useState(false);

  const handleLectureComplete = () => {
    if (currentLecture.progressValue === 1) {
      const allLectures = sampleCourse.sections.flatMap(
        (section) => section.lectures
      );
      const currentIndex = allLectures.findIndex(
        (lecture) => lecture.id === currentLecture.id
      );

      if (currentIndex < allLectures.length - 1) {
        setCurrentLecture(allLectures[currentIndex + 1]);
      } else {
        setShowCourseCompleteDialog(true);
        setShowConfetti(true);
      }
    }
  };

  //   console.log(studentCurrentCourseProgress?.progress.length);
  //   console.log(studentCurrentCourseProgress?.courseDetails.curriculum.length);

  // const handleGetCertificate = () => {
  //     // Certificate generation logic would go here
  //     console.log('Generating certificate...');
  // };

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold">
                  {studentCurrentCourseProgress?.courseDetails?.title}
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>

                <div className="flex items-center gap-2 text-sm">
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${
                          (studentCurrentCourseProgress?.progress?.length /
                            studentCurrentCourseProgress?.courseDetails
                              ?.curriculum?.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span>
                    {(studentCurrentCourseProgress?.progress?.length /
                      studentCurrentCourseProgress?.courseDetails?.curriculum
                        ?.length) *
                      100}
                    %
                  </span>
                </div>

                <button
                  onClick={() => setIsSideBarOpen(!isSideBarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {isSideBarOpen ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex">
          <div className={` max-sm: flex-1  transition-all duration-300`}>
            <div className="container mx-auto px-4 py-8">
              <div className="space-y-8">
                <VideoPlayer
                  width="100%"
                  height="500px"
                  url={currentLecture?.videoUrl}
                  onProgressUpdate={setCurrentLecture}
                  progressData={currentLecture}
                />

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-6">
                    {studentCurrentCourseProgress?.courseDetails
                      ?.instructorAvatar ? (
                      <img
                        src={
                          studentCurrentCourseProgress?.courseDetails
                            ?.instructorAvatar
                        }
                        alt={
                          studentCurrentCourseProgress?.courseDetails
                            ?.instructorName
                        }
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-600 text-white flex items-center justify-center">
                        {
                          studentCurrentCourseProgress?.courseDetails
                            ?.instructorName[0].toUpperCase()
                        }
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">
                        {
                          studentCurrentCourseProgress?.courseDetails
                            ?.instructorName
                        }
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300">
                    {studentCurrentCourseProgress?.courseDetails?.description}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <Quiz isDarkMode={darkMode} topic={currentLecture?.title} />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {isSideBarOpen && (
            <div
              className={`fixed inset-y-0 right-0 z-30 w-full max-md:top-[80px] md:w-[400px] ${
                isSideBarOpen ? "translate-x-0" : "translate-x-full"
              } bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-transform duration-300 md:relative md:translate-x-0`}
            >
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab("content")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
                    activeTab === "content"
                      ? "text-blue-500 border-b-2 border-blue-500"
                      : "text-gray-500"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Content
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
                    activeTab === "chat"
                      ? "text-blue-500 border-b-2 border-blue-500"
                      : "text-gray-500"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab("certificate")}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
                    activeTab === "certificate"
                      ? "text-blue-500 border-b-2 border-blue-500"
                      : "text-gray-500"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Certificate
                </button>
              </div>

              <div className="p-4 overflow-y-auto h-[calc(100%-48px)]">
                {activeTab === "content" && (
                  <CourseContent
                    curriculum={
                      studentCurrentCourseProgress?.courseDetails?.curriculum
                    }
                    currentLecture={currentLecture}
                    progress={studentCurrentCourseProgress?.progress}
                  />
                )}
                {activeTab === "chat" && (
                  <Chat
                    senderId={auth?.user._id}
                    username={auth.user.userName}
                    receiverId={
                      studentCurrentCourseProgress?.courseDetails?.instructorId
                    }
                    instructorName={
                      studentCurrentCourseProgress?.courseDetails
                        ?.instructorName
                    }
                  />
                )}
                {activeTab === "certificate" && (
                  <Certificate
                    progress={
                      (studentCurrentCourseProgress?.progress?.length /
                        studentCurrentCourseProgress?.courseDetails?.curriculum
                          ?.length) *
                      100
                    }
                    onGetCertificate={handleGetCertificate}
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Course Complete Dialog */}
      {showCourseCompleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
            <p className="mb-6">You have completed the course!</p>
            <div className="flex gap-4">
              <button
                onClick={handleGetCertificate}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Get Certificate
              </button>
              <button
                onClick={() => setShowCourseCompleteDialog(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewCourse;
