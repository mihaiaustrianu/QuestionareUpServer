const { Schema, model } = require("../db/connection"); // import Schema & model

const AnswerSchema = new Schema({
  answerText: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const QuestionSchema = new Schema({
  questionSetId: { type: String, required: true },
  text: { type: String, required: true },
  answers: { type: [AnswerSchema], required: true },
});

const Question = model("Question", QuestionSchema);

module.exports = Question;
