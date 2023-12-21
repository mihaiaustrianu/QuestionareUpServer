const { Schema, model } = require("../db/connection"); // import Schema & model

const UserAnswerSchema = new Schema({
  questionId: { type: String, required: true },
  userSelectedAnswer: { type: [], required: false },
});

const QuizSchema = new Schema({
  userId: { type: String, required: true },
  userAnswers: { type: [UserAnswerSchema], required: true },
  score: { type: Number, default: 0 },
  questions: { type: [Schema.Types.Mixed], required: true },
});

const Quiz = model("Quizes", QuizSchema);

module.exports = Quiz;
