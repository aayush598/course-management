const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: String, required: true },
    threadId: { type: String, required: true }, // Change from ObjectId to String
}, { timestamps: true });

module.exports = mongoose.model("Reply", ReplySchema);
