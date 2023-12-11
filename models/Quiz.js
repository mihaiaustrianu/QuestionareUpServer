const { Schema, model } = require("../db/connection"); // import Schema & model

const UserAnswerSchema = new Schema({
  questionId: { type: String, required: true },
  userSelectedAnswer: { type: String, required: true },
});

const QuizSchema = new Schema({
  userId: { type: String, required: true },
  userAnswers: { type: [UserAnswerSchema], required: true },
  score: { type: Number, default: 0 },
});

const Quiz = model("QuizModel", QuizSchema);

module.exports = Quiz;
