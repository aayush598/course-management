const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const QuizMark = require("../../models/QuizMark");

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Define Mongoose Schema
const quizSchema = new mongoose.Schema({
  topic: String,
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String,
      userResponse: String,
    },
  ],
  score: Number,
  timestamp: { type: Date, default: Date.now },
});

const Quiz = mongoose.model("Quiz", quizSchema);

// Generate Quiz
router.post("/generate-quiz", async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing. Check your .env file.");
    }

    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Quiz topic is required" });
    }

    const prompt = `Generate a multiple-choice quiz on ${topic} with 3 questions. 
        Provide the response in strict JSON format without markdown, code blocks, or extra formatting. 
        The JSON should follow this structure: 
        {
          "questions": [
            {
              "question": "",
              "options": ["", "", "", ""],
              "answer": ""
            }
          ]
        }`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    if (
      !response.data.candidates ||
      !response.data.candidates[0]?.content?.parts[0]?.text
    ) {
      throw new Error("Invalid response format from Gemini API.");
    }

    const quizData = JSON.parse(
      response.data.candidates[0].content.parts[0].text
    );
    res.json({ topic, questions: quizData.questions });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Submit Quiz
router.post("/submit-quiz", async (req, res) => {
  try {
    const { topic, questions, userResponses } = req.body;
    if (!topic || !questions || !userResponses) {
      return res.status(400).json({ error: "Missing required data." });
    }

    let score = 0;
    const processedQuestions = questions.map((q) => {
      const isCorrect = userResponses[q.question] === q.answer;
      if (isCorrect) score++;
      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.answer,
        userResponse: userResponses[q.question] || null,
      };
    });

    const quizRecord = new Quiz({
      topic,
      questions: processedQuestions,
      score,
    });
    await quizRecord.save();

    res.json({ message: "Quiz submitted successfully", score });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post("/update-quiz-marks", async (req, res) => {
  try {
    const { studentId, lectureId, marks, totalMarks } = req.body;
    if (!studentId || !lectureId || !marks || !totalMarks) {
      return res.status(400).json({ error: "Missing required data." });
    }

    console.log("studentId", studentId);

    const findQuiz = await QuizMark.findOne({ student : studentId, lectureId });
    if (!findQuiz) {
      const quizRecord = new QuizMark({
        student : studentId,
        lectureId,
        marks,
        totalMarks,
      });
      await quizRecord.save();
    } else {
      findQuiz.marks = marks;
      findQuiz.totalMarks = totalMarks;
      await findQuiz.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Quiz marks updated successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/get-quiz-marks/:studentId/:lectureId", async (req, res) => {
  try {
    const { studentId, lectureId } = req.params;
    if (!studentId || !lectureId) {
      return res.status(400).json({ error: "Missing required data." });
    }

    const findQuiz = await QuizMark.findOne({ studentId, lectureId });
    if (!findQuiz) {
      return res.status(404).json({ error: "Quiz marks not found" });
    }

    res.status(200).json({ success: true, data: findQuiz });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/get-all-quiz-marks", async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ error: "Missing required data." });
    }

    const findQuiz = await QuizMark.find({
      studentId,
    });
    if (!findQuiz) {
      return res.status(404).json({ error: "Quiz marks not found" });
    }

    const mark = findQuiz.reduce((acc, curr) => {
      return acc + curr.marks;
    });



    const totalMarks = findQuiz.reduce((acc, curr) => {
      return acc + curr.totalMarks;
    });

    if(totalMarks === 0){
      return res.status(200).json({ success: true, data: { mark, totalMarks , result : 0 } });
    }

    res.status(200).json({ success: true, data: { mark, totalMarks , result : 100*mark/totalMarks } });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/get/leaderboard", async (req, res) => {
    try {
        const students = await QuizMark.find({})
            .populate('student', 'userName')
            .sort({marks: -1})
            .limit(10);
        
        console.log(students);
        
        const studentsWithRank = students.map(student => {
            return {
                id: student._id,
                userName: student.student?.userName,
                marks: student.marks,
                totalMarks: student.totalMarks,
                result: student.totalMarks > 0 ? 100 * student.marks / student.totalMarks : 0
            }
        });
        
        console.log(studentsWithRank);
        
        res.status(200).json({ success: true, data: studentsWithRank });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
})

module.exports = router;
