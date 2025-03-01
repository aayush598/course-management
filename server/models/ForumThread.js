const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ForumThreadSchema = new mongoose.Schema({
    threadId: { type: String, unique: true },
    title: String,
    content: String,
    author: String,
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reply" }]
}, { timestamps: true });

// Assign a unique threadId before saving
ForumThreadSchema.pre("save", function(next) {
    if (!this.threadId) {
        this.threadId = uuidv4();
    }
    next();
});

module.exports = mongoose.model("ForumThread", ForumThreadSchema);