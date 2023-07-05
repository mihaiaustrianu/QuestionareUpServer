const { Router } = require("express");
const { isLoggedIn } = require("./middleware");
const Question = require("../models/Question");

const router = Router();

router.use(isLoggedIn);

// Creates a question in a question set
router.post("/:id", async (req, res) => {
  try {
    const questionSetId = req.params.id;
    const { title, text, answers } = req.body;

    const newQuestion = { questionSetId, title, text, answers };

    Question.create(newQuestion);

    return res
      .status(200)
      .json({ message: "Succesfully added a new question", newQuestion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get questions" });
  }
});

// Gets the user's questions from a specific question set
router.get("/:id", async (req, res) => {
  try {
    const questionSetId = req.params.id;
    const questions = await Question.find({ questionSetId });

    if (questions) {
      return res.status(200).json(questions);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get question sets" });
  }
});

module.exports = router;
