const mongoose = require("mongoose");

const QuizMarkSchema = new mongoose.Schema({
    student : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    lectureId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Lecture"
    },
    marks : Number,
    totalMarks : Number,
})

module.exports = mongoose.model("QuizMark", QuizMarkSchema);