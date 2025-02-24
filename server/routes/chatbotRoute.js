const express = require("express");
const router = express.Router();
const axios = require("axios");

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

router.post("/ask", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const response = await axios.post(
      API_URL,
      {
        contents: [{ parts: [{ text: message }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I didn't understand that.";

    res.json({ success: true, response: aiResponse });
  } catch (error) {
    console.error("Error fetching AI response:", error);
    res.status(500).json({ success: false, error: "Failed to fetch AI response" });
  }
});

module.exports = router;
