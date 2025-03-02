const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const mongoose = require("mongoose");
const pdfParse = require("pdf-parse");
const { Readable } = require("stream");
const mime = require("mime-types");

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// **Assignment Schema**
const assignmentSchema = new mongoose.Schema({
    courseId: String,
    courseName: String, // ✅ Added courseName for assignment generation
    assignments: [
        {
            title: String,
            description: String,
            content: String,
        },
    ],
});

const Assignment = mongoose.model("Assignment", assignmentSchema);

// **Multer Storage Configuration**
const storage = multer.memoryStorage();
const upload = multer({ storage });

// **Fetch Assignments (Generate if Not Found)**
router.get("/:courseId/:courseName", async (req, res) => {
    try {
        const { courseId, courseName } = req.params;
        console.log(`Fetching assignments for course ID: ${courseId} and course name: ${courseName}`);

        let assignmentData = await Assignment.findOne({ courseId });

        if (!assignmentData) {
            console.log("No assignments found, generating new ones...");

            // 🔥 **Updated Prompt to Use Course Name**
            const prompt = `
            Generate three unique assignments for the course "${courseName}". 
            Each assignment must include:
            - Title
            - Detailed Description
            - Full Content
            Format:
            [
                {"title": "Assignment 1", "description": "Detailed Description 1", "content": "Complete Assignment 1"},
                {"title": "Assignment 2", "description": "Detailed Description 2", "content": "Complete Assignment 2"},
                {"title": "Assignment 3", "description": "Detailed Description 3", "content": "Complete Assignment 3"}
            ]`;

            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                { contents: [{ parts: [{ text: prompt }] }] },
                { headers: { "Content-Type": "application/json" } }
            );

            let responseText = response.data.candidates[0].content.parts[0].text;
            responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

            console.log("Gemini API Response:", responseText);

            // ✅ Store Assignments in Database
            const assignments = JSON.parse(responseText);
            assignmentData = new Assignment({ courseId, courseName, assignments });
            await assignmentData.save();
            console.log("✅ Assignments successfully saved.");
        } else {
            console.log("Assignments found in database, returning data.");
        }

        res.json({ success: true, assignments: assignmentData.assignments });
    } catch (error) {
        console.error("Error fetching assignments:", error.message);
        res.status(500).json({ error: "Error fetching assignments", details: error.message });
    }
});

// **Submit Assignment and Evaluate**
router.post("/submit/:courseId/:assignmentIndex", upload.single("assignmentFile"), async (req, res) => {
    try {
        const { courseId, assignmentIndex } = req.params;
        console.log(`📂 Receiving assignment ${assignmentIndex} for course ${courseId}`);

        if (!req.file) {
            console.error("❌ No file uploaded");
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("✅ File received:", req.file.originalname, req.file.mimetype);

        // ✅ Detect File Type
        const fileExt = mime.extension(req.file.mimetype);
        console.log("📂 Detected file type:", fileExt);

        let textContent = "";
        if (fileExt === "pdf") {
            textContent = (await pdfParse(req.file.buffer)).text;
        } else if (["txt", "md"].includes(fileExt)) {
            textContent = req.file.buffer.toString("utf-8");
        } else {
            console.error("❌ Unsupported file type:", fileExt);
            return res.status(400).json({ error: "Unsupported file type" });
        }

        console.log(`📜 Extracted Text: ${textContent.substring(0, 100)}...`);

        // ✅ Fetch Assignment Description for Better Evaluation
        const assignmentData = await Assignment.findOne({ courseId });
        if (!assignmentData) {
            return res.status(404).json({ error: "Assignment not found" });
        }
        const assignment = assignmentData.assignments[assignmentIndex];
        const assignmentDescription = assignment?.description || "No description available.";

        // 🔥 **Updated Prompt: Uses Assignment Description for Context**
        const prompt = `
        Analyze the following assignment submission and provide structured feedback. 
        DO NOT include markdown, extra formatting, or special characters. Output must be valid JSON.

        **Assignment Details:**
        - **Title:** ${assignment.title}
        - **Description:** ${assignmentDescription}

        **Evaluation Criteria:**
        1️⃣ **Overall Score (0-100)**: Score based on correctness, structure, and originality.
        2️⃣ **Grammar & Language**: Spelling, grammar, clarity.
        3️⃣ **Plagiarism Analysis**: Check for copied content.
        4️⃣ **Technical Accuracy**: Identify correct and incorrect facts.
        5️⃣ **Areas of Improvement**: Provide constructive feedback.
        6️⃣ **Missing Key Points**: Highlight any missing important aspects.

        **Format (Strict JSON, No Special Characters)**:
        {
            "score": 85,
            "remarks": "Good analysis but lacks details.",
            "grammar": { "issues": 3, "suggestions": ["Use active voice in the introduction."] },
            "plagiarism": { "detected": false, "similarity_percentage": 12 },
            "accuracy": { "correct_facts": 10, "incorrect_facts": 2, "corrections": ["Incorrect statement about AI efficiency."] },
            "improvements": ["Provide more real-world examples.", "Use citations for factual claims."],
            "missing_points": ["No mention of deep learning advancements."]
        }

        **Student Submission:**
        ${textContent}`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            { contents: [{ parts: [{ text: prompt }] }] },
            { headers: { "Content-Type": "application/json" } }
        );

        let evaluationText = response.data.candidates[0].content.parts[0].text;
        evaluationText = evaluationText.replace(/```json/g, "").replace(/```/g, "").trim();

        let evaluation;
        try {
            evaluation = JSON.parse(evaluationText);
        } catch (jsonError) {
            console.error("❌ JSON Parsing Error:", jsonError.message);
            return res.status(500).json({ error: "Invalid JSON from Gemini", details: evaluationText });
        }

        res.json({ success: true, evaluation });
    } catch (error) {
        console.error("❌ Error processing assignment:", error.message);
        res.status(500).json({ error: "Error processing assignment", details: error.message });
    }
});

module.exports = router;
