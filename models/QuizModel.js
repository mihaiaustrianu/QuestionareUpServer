const { Schema, model } = require("../db/connection"); // import Schema & model

const UserAnswerSchema = new Schema({
  questionId: { type: String, required: true },
  userSelectedAnswer: { type: [], required: false },
});

const QuizSchema = new Schema({
  userId: { type: String, required: true },
  userAnswers: { type: [UserAnswerSchema], required: true },
  score: { type: Number, default: 0 },
  submissionDate: { type: Date },
  questions: { type: [Schema.Types.Mixed], required: true },
  startTime: { type: Date },
  endTime: { type: Date },
});

const Quiz = model("Quizes", QuizSchema);

module.exports = Quiz;
