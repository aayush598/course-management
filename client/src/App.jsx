import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth";
import RouteGuard from "./components/route-guard";
import { useContext, useEffect, useMemo } from "react";
import { AuthContext } from "./context/auth-context";
import InstructorDashboardpage from "./pages/instructor";
import StudentViewCommonLayout from "./components/student-view/common-layout";
import StudentHomePage from "./pages/student/home";
import NotFoundPage from "./pages/not-found";
import AddNewCoursePage from "./pages/instructor/add-new-course";
import StudentViewCoursesPage from "./pages/student/courses";
import StudentViewCourseDetailsPage from "./pages/student/course-details";
import PaypalPaymentReturnPage from "./pages/student/payment-return";
import StudentCoursesPage from "./pages/student/student-courses";
import StudentViewCourseProgressPage from "./pages/student/course-progress";
import Chatbot from "./components/chatbot/Chatbot";
import { io } from "socket.io-client";
import { SocketContext } from "./context/socket-context/SocketContext";
import ViewCourse from "./pages/student/view-course/ViewCourse";
import Forum from "./pages/Forum";
import ThreadDetails from "./pages/ThreadDetails";


function App() {
  const { auth } = useContext(AuthContext);
  const { setSocket } = useContext(SocketContext);

  useEffect(() => {
    if (auth?.user?._id) {
      const socket = io("http://localhost:5000");
      setSocket(socket);

      return () => {
        socket?.disconnect();
      };
    }
  }, [auth?.user?._id, setSocket]);

  return (
    <>
      <Routes>
        <Route
          path="/auth"
          element={
            <RouteGuard
              element={<AuthPage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor"
          element={
            <RouteGuard
              element={<InstructorDashboardpage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor/create-new-course"
          element={
            <RouteGuard
              element={<AddNewCoursePage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/instructor/edit-course/:courseId"
          element={
            <RouteGuard
              element={<AddNewCoursePage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />
        <Route
          path="/"
          element={
            <RouteGuard
              element={<StudentViewCommonLayout />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        >
          <Route path="" element={<StudentHomePage />} />
          <Route path="home" element={<StudentHomePage />} />
          <Route path="courses" element={<StudentViewCoursesPage />} />
          <Route
            path="course/details/:id"
            element={<StudentViewCourseDetailsPage />}
          />
          <Route path="payment-return" element={<PaypalPaymentReturnPage />} />
          <Route path="student-courses" element={<StudentCoursesPage />} />
          {/* <Route
          path="course-progress/:id"
          element={<StudentViewCourseProgressPage />}
        /> */}
        <Route path="course-progress/:id" element={<ViewCourse />} />
        <Route path="forum" element={<Forum />} />
        <Route path="/forum/thread/:threadId" element={<ThreadDetails />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    <Chatbot /> {/* Add Chatbot Here */}
    </>
  );
}

export default App;
