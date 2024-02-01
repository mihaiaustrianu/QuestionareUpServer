const { Router } = require("express");
const { isLoggedIn } = require("./middleware");
const QuestionSet = require("../models/QuestionSet");
const Question = require("../models/Question");
const Quiz = require("../models/QuizModel");

const router = Router();

router.use(isLoggedIn);

router.post("/create", async (req, res) => {
  try {
    const { questionSetIds, numberOfQuestions, userId, timeToSolve } = req.body;

    // Fetch all questions from the provided question sets
    const allQuestions = await Question.find({
      questionSetId: { $in: questionSetIds },
    });

    // Shuffle the array of questions
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

    // Use a Set to keep track of selected question IDs to avoid duplicates
    const selectedQuestionIds = new Set();
    const selectedQuestions = [];

    for (const question of shuffledQuestions) {
      if (selectedQuestionIds.size >= numberOfQuestions) {
        break;
      }

      if (!selectedQuestionIds.has(question._id)) {
        selectedQuestionIds.add(question._id);
        selectedQuestions.push(question);
      }
    }

    // Check if there are enough questions
    if (selectedQuestions.length < numberOfQuestions) {
      return res.status(400).json({
        error: "Not enough questions across selected question sets",
      });
    }

    // Shuffle the array of selected questions
    selectedQuestions.sort(() => Math.random() - 0.5);

    const finalSelectedQuestions = selectedQuestions.slice(
      0,
      numberOfQuestions
    );

    const startTime = Date.now();
    const endTime = startTime + timeToSolve * 1000 * 60;

    // Create a new quiz object
    const quiz = new Quiz({
      userId,
      userAnswers: finalSelectedQuestions.map((question) => ({
        questionId: question._id,
        userSelectedAnswer: "",
      })),
      questions: finalSelectedQuestions,
      score: 0,
      startTime,
      endTime,
    });

    // Save the quiz object to the database
    await quiz.save();

    return res.status(200).json({
      quizId: quiz._id,
      questions: finalSelectedQuestions,
      startTime,
      endTime,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:quizId/submit", async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userAnswers } = req.body;

    // Find the quiz by ID
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Update user answers in the quiz
    quiz.userAnswers.forEach((answer) => {
      const submittedAnswer = userAnswers[answer.questionId];

      if (submittedAnswer) {
        answer.userSelectedAnswer = submittedAnswer;
      }
    });

    quiz.submissionDate = new Date();

    let score = 0;

    // Score calculation
    quiz.questions.forEach((question) => {
      const correctAnswers = question.answers
        .filter((answer) => answer.isCorrect)
        .map((answer) => String(answer._id)); // Ensure ID consistency

      const userSelectedAnswers =
        quiz.userAnswers.find(
          (answer) => answer.questionId.toString() === question._id.toString()
        )?.userSelectedAnswer || [];

      // Check if user selected all correct answers for the question
      const isCorrect =
        correctAnswers.length === userSelectedAnswers.length &&
        correctAnswers.every((correctAnswer) =>
          userSelectedAnswers.includes(correctAnswer)
        );

      if (isCorrect) {
        score += 1;
      }
    });

    quiz.score = score;

    await quiz.save();

    return res
      .status(200)
      .json({ message: "User answers submitted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findById(quizId);

    if (quiz) {
      return res.status(200).json(quiz);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get quiz" });
  }
});

router.get("/", async (req, res) => {
  const { userId } = req.user;
  try {
    const quizes = await Quiz.find({ userId });

    if (quizes) {
      return res.status(200).json(quizes);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get user quizes" });
  }
});

router.post("/validateToken", (req, res) => {
  console.log(req);
  const userId = req.user.userId;
  res.json({ userId });
});

module.exports = router;
