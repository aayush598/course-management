const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: String, required: true },
    threadId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now } // ✅ Ensure createdAt is stored
}, { timestamps: true });

module.exports = mongoose.model("Reply", ReplySchema);
