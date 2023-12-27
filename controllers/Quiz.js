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

    // Fetch question sets based on provided IDs
    const questionSets = await QuestionSet.find({
      _id: { $in: questionSetIds },
    });

    // Check if the questionSetId's are valid
    if (questionSetIds.length !== questionSets.length) {
      return res
        .status(401)
        .json({ error: "The questionSetId's you provided are not correct" });
    }

    // Check if there are enough questions across all sets
    const totalQuestionsInSets = await Question.countDocuments({
      questionSetId: { $in: questionSetIds },
    });

    if (totalQuestionsInSets < numberOfQuestions) {
      return res
        .status(400)
        .json({ error: "Not enough questions across all question sets" });
    }

    // Randomly select a number of questions from each question set
    const selectedQuestions = [];
    const selectedQuestionIds = new Set();
    let totalSelectedQuestions = 0;

    while (totalSelectedQuestions < numberOfQuestions) {
      for (const questionSet of questionSets) {
        const numQuestionsInSet = await Question.countDocuments({
          questionSetId: questionSet.id,
        });

        if (numQuestionsInSet === 0) {
          // Skip sets with no questions
          continue;
        }

        const numQuestionsToSelect = Math.min(
          Math.floor(Math.random() * (numQuestionsInSet + 1)),
          numberOfQuestions - totalSelectedQuestions
        );

        // Use aggregation pipeline to fetch and shuffle questions
        const questionsToSelect = await Question.aggregate([
          {
            $match: {
              questionSetId: questionSet.id,
              _id: { $nin: Array.from(selectedQuestionIds) },
            },
          },
          { $sample: { size: numQuestionsToSelect } },
        ]);

        // Add selected questions to the final list and update the set of selected question IDs
        for (const question of questionsToSelect) {
          selectedQuestions.push(question);
          selectedQuestionIds.add(question._id);
        }

        totalSelectedQuestions += numQuestionsToSelect;
      }
    }

    // Shuffle the array of selected questions
    selectedQuestions.sort(() => Math.random() - 0.5);

    // Trim the array to the desired number of total questions
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
        .map((answer) => answer._id);

      const userSelectedAnswers =
        quiz.userAnswers.find((answer) => answer.questionId === question._id)
          ?.userSelectedAnswer || [];

      // Check if user selected all correct answers for the question
      const isCorrect = correctAnswers.every((correctAnswer) =>
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
