import InstructorChat from "@/components/instructor-view/chat/InstructorChat";
import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/services";
import { BarChart, Book, LogOut, Clipboard, MessageCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";

function InstructorDashboardpage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { auth } = useContext(AuthContext);
  console.log(auth, "auth");
  
  const { auth, resetCredentials } = useContext(AuthContext);
  const { instructorCoursesList, setInstructorCoursesList } =
    useContext(InstructorContext);
  const [referrals, setReferrals] = useState([]);
console.log(instructorCoursesList, "instructorCoursesList");

  async function fetchAllCourses() {
    const response = await fetchInstructorCourseListService();
    if (response?.success) setInstructorCoursesList(response?.data);
  }

  async function fetchReferrals() {
    if (auth?.user) {
      try {
        const token = JSON.parse(sessionStorage.getItem("accessToken")); // ✅ Retrieve token
        console.log("auth : ", auth);
        const response = await fetch(`http://localhost:5000/instructor/referrals/${auth.user._id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Include token
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
  
        if (data.success) {
          setReferrals(data.referrals);
        } else {
          console.error("Error fetching referrals:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch referrals:", error);
      }
    }
  }
  

  useEffect(() => {
    fetchAllCourses();
    fetchReferrals();
  }, [auth]);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  function copyReferralCode() {
    navigator.clipboard.writeText(auth.user.referralCode);
    alert("Referral code copied!");
  }

  const menuItems = [
    {
      icon: BarChart,
      label: "Dashboard",
      value: "dashboard",
      component: <InstructorDashboard listOfCourses={instructorCoursesList} />,
    },
    {
      icon: Book,
      label: "Courses",
      value: "courses",
      component: <InstructorCourses listOfCourses={instructorCoursesList} />,
    },
    {
      icon: LogOut,
      label: "Logout",
      value: "logout",
      component: null,
    },
    {
      icon: MessageCircle,
      label: "Chat",
      value: "chat",
      component: <InstructorChat instructorId={auth?.user?._id}  />,
    },
  ];

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Instructor View</h2>
          <nav>
            {menuItems.map((menuItem) => (
              <Button
                className="w-full justify-start mb-2"
                key={menuItem.value}
                variant={activeTab === menuItem.value ? "secondary" : "ghost"}
                onClick={
                  menuItem.value === "logout"
                    ? handleLogout
                    : () => setActiveTab(menuItem.value)
                }
              >
                <menuItem.icon className="mr-2 h-4 w-4" />
                {menuItem.label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeTab == "chat" ? null : (
            <h1 className="text-3xl font-bold mb-8">Dashboard </h1>
          )}

          {/* Referral Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold">Your Referral Code</h2>
            <div className="flex items-center space-x-2 mt-2">
              <span className="px-3 py-1 bg-gray-200 rounded">{auth.user.referralCode}</span>
              <Button onClick={copyReferralCode}>
                <Clipboard className="h-4 w-4 mr-1" /> Copy
              </Button>
            </div>
          </div>

          {/* Referral List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Referrals Used</h2>
            {referrals.length > 0 ? (
              <ul className="list-disc pl-5 mt-3">
                {referrals.map((user) => (
                  <li key={user._id}>
                    {user.userName} ({user.userEmail})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 mt-3">No referrals used yet.</p>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            {menuItems.map((menuItem) => (
              <TabsContent key={menuItem.value} value={menuItem.value}>
                {menuItem.component !== null ? menuItem.component : null}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboardpage;
