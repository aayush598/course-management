import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  getCertificateService,
  getCurrentCourseProgressService,
  markLectureAsViewedService,
  resetCourseProgressService,
} from "@/services";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";
import Quiz from "./quiz";
import Chat from "@/components/chat/Chat";

function StudentViewCourseProgressPage() {

  
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
        useEffect(() => {
          console.log("studentCurrentCourseProgress", studentCurrentCourseProgress);
          
        },[studentCurrentCourseProgress])
        

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
        date: studentCurrentCourseProgress?.progress?.completionDate || 
              new Date().toLocaleDateString(),
      });

      // Create blob from the arrayBuffer
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'certificate.pdf');
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
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

  // useEffect(() => {
  //   if(certificate){
  //     const blob = new Blob([certificate], { type: 'application/pdf' });

  //           // Create a URL for the blob
  //           const url = window.URL.createObjectURL(blob);

  //           // Create an invisible <a> tag
  //           const link = document.createElement('a');
  //           link.href = url;
  //           link.setAttribute('download', 'certificate.pdf'); // File name
  //           document.body.appendChild(link);
  //           link.click(); // Trigger download

  //           // Cleanup
  //           document.body.removeChild(link);
  //           window.URL.revokeObjectURL(url);
  //   }
  // } , [certificate]);

  // console.log(studentCurrentCourseProgress.courseDetails.instructorId, "studentCurrentCourseProgress");
  

  // Proper logging for production can be added here if needed

  return (
    <div className="`min-h-screen ${darkMode ? 'dark' : ''}`">
                  <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {showConfetti && <Confetti />}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate("/student-courses")}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            variant="ghost"
            size="sm"
          >
             <ArrowLeft className="w-6 h-6" />
           
          </Button>
          <h1 className="text-xl font-semibold">
            {studentCurrentCourseProgress?.courseDetails?.title}
          </h1>
        </div>
        <Button onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
          {isSideBarOpen ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
      </div>
      </header>
      <div className="flex">
      <div className={` max-sm: flex-1  transition-all duration-300`}>
        <div
          className="container mx-auto px-4 py-8"
        >
          <div className="space-y-8">
            <VideoPlayer
              width="100%"
              height="500px"
              url={currentLecture?.videoUrl}
              onProgressUpdate={setCurrentLecture}
              progressData={currentLecture}
            />
            <div className="">
              <h2 className="">{currentLecture?.title}</h2>
            </div>
            <div>
              <Quiz topic={currentLecture?.title} />
              {currentLecture?.videoUrl}
            </div>
          </div>
        </div>
        </div>
        <div
          className=""
        >
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="grid bg-[#1c1d1f] w-full grid-cols-3 p-0 h-14">
              <TabsTrigger
                value="content"
                className=" text-black rounded-none h-full"
              >
                Course Content
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className=" text-black rounded-none h-full"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="certificate"
                className=" text-black rounded-none h-full"
              >
                Certificate
              </TabsTrigger>
              <TabsTrigger
                value="Chat"
                className=" text-black rounded-none h-full"
              >
                Chat
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {studentCurrentCourseProgress?.courseDetails?.curriculum.map(
                    (item) => (
                      <div
                        className="flex items-center space-x-2 text-sm text-white font-bold cursor-pointer"
                        key={item._id}
                      >
                        {studentCurrentCourseProgress?.progress?.find(
                          (progressItem) => progressItem.lectureId === item._id
                        )?.viewed ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Play className="h-4 w-4 " />
                        )}
                        <span>{item?.title}</span>
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="overview" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">About this course</h2>
                  <p className="text-gray-400">
                    {studentCurrentCourseProgress?.courseDetails?.description}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="certificate" className="flex-1 overflow-hidden">
              
                {
                  studentCurrentCourseProgress?.progress?.length !== studentCurrentCourseProgress?.courseDetails?.curriculum.length ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex flex-col items-center space-y-4">
                        <Check className="h-20 w-20 text-green-500" />
                        <h2 className="text-2xl font-bold">Congratulations!</h2>
                        <p>
                          You have completed the course{" "}
                          {studentCurrentCourseProgress?.courseDetails?.title}
                        </p>
                        <Button onClick={handleGetCertificate}>
                          Get The Certificate
                        </Button>
                        <Button onClick={() => navigate("/student-courses")}>
                          My Courses Page
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex flex-col items-center space-y-4">
                        <h2 className="text-2xl font-bold">Certificate</h2>
                        <p>
                          You need to complete the course to get the certificate
                        </p>
                      </div>
                    </div>
                  )
                }
            
            </TabsContent>
            <TabsContent value="Chat" className="flex-1 overflow-hidden">
              { studentCurrentCourseProgress?.courseDetails?.instructorId && <Chat senderId = {auth?.user?._id} receiverId = { studentCurrentCourseProgress?.courseDetails?.instructorId} />}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      </div>
      
      <Dialog open={lockCourse}>
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>You can't view this page</DialogTitle>
            <DialogDescription>
              Please purchase this course to get access
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={showCourseCompleteDialog}>
        <DialogContent showOverlay={false} className="sm:w-[425px] p-4">
          <DialogHeader>
            <DialogTitle>Congratulations!</DialogTitle>
            <DialogDescription className="flex flex-col gap-3">
              <Label>You have completed the course</Label>
              <div className="flex flex-row gap-1">
                <Button onClick={() => navigate("/student-courses")}>
                  My Courses Page
                </Button>
                <Button onClick={handleRewatchCourse}>Rewatch Course</Button>
                <Button onClick={handleGetCertificate}>
                          Certificate
                        </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseProgressPage;
