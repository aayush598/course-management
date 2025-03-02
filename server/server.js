require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth-routes/index");
const mediaRoutes = require("./routes/instructor-routes/media-routes");
const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
const studentViewOrderRoutes = require("./routes/student-routes/order-routes");
const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");
const quizRoutes = require("./routes/student-routes/quiz-routes");
const chatbotRoute = require("./routes/chatbotRoute");
const referralRoutes = require("./routes/instructor-routes/referral-routes");
const chatRoute = require("./routes/message-routes/message-routes");
const forumRoutes = require("./routes/forum-routes");
const {
  sendMessage,
} = require("./controllers/message-controller/message-controller");
const { Server } = require("socket.io");
const http = require("http");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin (change if needed)
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

//database connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("mongodb is connected"))
  .catch((e) => console.log(e));

//routes configuration
app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.use("/instructor/course", instructorCourseRoutes);
app.use("/student/course", studentViewCourseRoutes);
app.use("/student/order", studentViewOrderRoutes);
app.use("/student/courses-bought", studentCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);
app.use("/quiz", quizRoutes);
app.use("/chatbot", chatbotRoute);
app.use("/instructor/referrals", referralRoutes);
app.use("/chat", chatRoute);
app.use("/forum", forumRoutes);
app.use("/assignments", require("./routes/assignment-routes"));


app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});
let users = {};
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("join", (data) => {
    users[data.senderId] = socket.id;
    console.log(users);
    console.log(`user with id ${data.senderId} joined \n\n\n\n`);
    
  });

  socket.on("send-message", (data) => {
    console.log(users);
    
    console.log(`sending message ${data.message} to ${data.receiverId}`);
    const receiverSocketId = users[data.receiverId];

    if(data.senderId === data.receiverId){
      return;
    }

    if (!receiverSocketId) {
      console.log("receiver not online");
      
      console.log("message saved to database");
      
    } else {
      console.log("receiver online");
      io.to(receiverSocketId).emit("receive-message", data);
    }
    sendMessage({senderId : data.senderId, receiverId:  data.receiverId,message: data.message});
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected");
    users = Object.fromEntries(
      Object.entries(users).filter(([key, value]) => value !== socket.id)
    );
  });
});

server.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});
