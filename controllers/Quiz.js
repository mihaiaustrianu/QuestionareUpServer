const { Router } = require("express");
const { isLoggedIn } = require("./middleware");
const QuestionSet = require("../models/QuestionSet");
const Question = require("../models/Question");

const router = Router();

router.use(isLoggedIn);

router.post("/", async (req, res) => {
  try {
    const { questionSetIds, numberOfQuestions } = req.body;

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

    return res.status(200).json(finalSelectedQuestions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
