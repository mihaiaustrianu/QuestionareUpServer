const { Schema, model } = require("../db/connection"); // import Schema & model

const QuestionSetSchema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const QuestionSet = model("QuestionSet", QuestionSetSchema);

module.exports = QuestionSet;
