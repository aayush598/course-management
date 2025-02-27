const express = require("express");
const ForumThread = require("../models/ForumThread");
const Reply = require("../models/Reply");
const router = express.Router();

// Get all threads
router.get("/threads", async (req, res) => {
    try {
        const threads = await ForumThread.find({}, "threadId title author");
        res.json(threads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get thread by threadId
router.get("/threads/:threadId", async (req, res) => {
    try {
        console.log("Requested threadId:", req.params.threadId); // Debug log
        
        // Ensure threadId is searched as a string
        const thread = await ForumThread.findOne({ threadId: String(req.params.threadId) }).populate("replies");

        if (!thread) {
            console.log("Thread not found in DB");
            return res.status(404).json({ message: "Thread not found" });
        }
        
        console.log("Thread found:", thread);
        res.json(thread);
    } catch (error) {
        console.error("Error fetching thread:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/threads/:threadId/replies", async (req, res) => {
    try {
        const { content, author } = req.body; // Extract values safely

        if (!content || !author) {
            return res.status(400).json({ message: "Reply and author name are required" });
        }

        if (typeof content !== "string" || typeof author !== "string") {
            return res.status(400).json({ message: "Invalid input type" });
        }

        const reply = new Reply({
            content: content.trim(),
            author: author.trim(),
            threadId: req.params.threadId, // Ensure threadId is stored as a string
        });

        await reply.save();
        await ForumThread.findOneAndUpdate(
            { threadId: req.params.threadId },
            { $push: { replies: reply._id } }
        );

        res.status(201).json(reply);
    } catch (error) {
        console.error("Error creating reply:", error);
        res.status(500).json({ message: "Server error" });
    }
});



// Create a new thread
router.post("/threads", async (req, res) => {
    try {
        if (!req.body.title || !req.body.content || !req.body.author) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const thread = new ForumThread({ ...req.body, threadId: new Date().getTime().toString() });
        await thread.save();
        res.status(201).json(thread);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;