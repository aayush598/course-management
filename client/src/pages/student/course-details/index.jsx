import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  createPaymentService,
  fetchStudentViewCourseDetailsService,
  getFreeCourseService,
  recordUserInterectionService,
} from "@/services";
import { CheckCircle, Globe, Lock, PlayCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function StudentViewCourseDetailsPage() {
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    setLoadingState,
  } = useContext(StudentContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Extract courseId correctly
  const { id: courseId } = useParams();
  const [currentCourseDetailsId, setCurrentCourseDetailsId] = useState(
    courseId || null
  );
  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] =
    useState(null);
  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);
  const [approvalUrl, setApprovalUrl] = useState("");

  // ✅ Fetch Course Details
  async function fetchStudentViewCourseDetails() {
    if (!courseId) {
      console.error("fetchStudentViewCourseDetails: Missing courseId");
      return;
    }

    console.log(`Fetching Course Details for courseId: ${courseId}`);

    const response = await fetchStudentViewCourseDetailsService(courseId);

    if (response?.success) {
      setStudentViewCourseDetails(response?.data);
      setLoadingState(false);
    } else {
      setStudentViewCourseDetails(null);
      setLoadingState(false);
    }
  }

  // ✅ Record User Interaction
  const recordInterectio = async ({ userId, courseId, interactionType }) => {
    if (!courseId) {
      console.error("recordInterection: courseId is missing");
      return;
    }

    console.log(
      `Recording interaction: userId=${userId}, courseId=${courseId}, interactionType=${interactionType}`
    );

    try {
      const response = await recordUserInterectionService({
        userId,
        courseId,
        interactionType,
      });

      if (response?.success) {
        console.log("Interaction recorded successfully!");
      } else {
        console.error("Failed to record interaction:", response?.message);
      }
    } catch (error) {
      console.error("Error in recordInterectio:", error);
    }
  };

  // ✅ Handle Course Purchase
  async function handleCreatePayment() {
    if (!courseId) {
      console.error("handleCreatePayment: Missing courseId");
      return;
    }

    const paymentPayload = {
      userId: auth?.user?._id,
      userName: auth?.user?.userName,
      userEmail: auth?.user?.userEmail,
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "initiated",
      orderDate: new Date(),
      paymentId: "",
      payerId: "",
      instructorId: studentViewCourseDetails?.instructorId,
      instructorName: studentViewCourseDetails?.instructorName,
      courseImage: studentViewCourseDetails?.image,
      courseTitle: studentViewCourseDetails?.title,
      courseId: courseId,
      coursePricing: studentViewCourseDetails?.pricing,
    };

    console.log("Payment Payload:", paymentPayload);

    // const response = await createPaymentService(paymentPayload);

    // if (response?.success) {
    //   sessionStorage.setItem("currentOrderId", JSON.stringify(response?.data?.orderId));
    //   recordInterectio({ userId: auth?.user?._id, courseId, interactionType: "enroll" });
    //   setApprovalUrl(response?.data?.approveUrl);
    // }

    const response = await getFreeCourseService(paymentPayload);
    if (response?.success) {
      console.log("response.data success", response?.data);
    }
  }

  // ✅ Effects
  useEffect(() => {
    if (courseId) {
      setCurrentCourseDetailsId(courseId);
      fetchStudentViewCourseDetails();
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      recordInterectio({
        userId: auth?.user?._id,
        courseId,
        interactionType: "view",
      });
    }
  }, [courseId]);

  useEffect(() => {
    if (displayCurrentVideoFreePreview !== null) setShowFreePreviewDialog(true);
  }, [displayCurrentVideoFreePreview]);

  // ✅ Redirect to Payment if Approval URL Exists
  if (approvalUrl !== "") {
    window.location.href = approvalUrl;
  }

  return (
    <div className="mx-auto p-4">
      <div className="bg-gray-900 text-white p-8 rounded-t-lg">
        <h1 className="text-3xl font-bold mb-4">
          {studentViewCourseDetails?.title}
        </h1>
        <p className="text-xl mb-4">{studentViewCourseDetails?.subtitle}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-8">
        <main className="flex-grow">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What you'll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {studentViewCourseDetails?.objectives
                  ?.split(",")
                  .map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              {studentViewCourseDetails?.curriculum?.map(
                (curriculumItem, index) => (
                  <li
                    key={curriculumItem?.id || index}
                    className={`${
                      curriculumItem?.freePreview
                        ? "cursor-pointer"
                        : "cursor-not-allowed"
                    } flex items-center mb-4`}
                    onClick={
                      curriculumItem?.freePreview
                        ? () =>
                            setDisplayCurrentVideoFreePreview(
                              curriculumItem.videoUrl
                            )
                        : null
                    }
                  >
                    {curriculumItem?.freePreview ? (
                      <PlayCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <Lock className="mr-2 h-4 w-4" />
                    )}
                    <span>{curriculumItem?.title}</span>
                  </li>
                )
              )}
            </CardContent>
          </Card>
        </main>

        <aside className="w-full md:w-[500px]">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <div className="aspect-video mb-4 rounded-lg flex items-center justify-center">
                <VideoPlayer
                  url={displayCurrentVideoFreePreview}
                  width="450px"
                  height="200px"
                />
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  ${studentViewCourseDetails?.pricing}
                </span>
              </div>
              <Button onClick={handleCreatePayment} className="w-full">
                Buy Now
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default StudentViewCourseDetailsPage;
