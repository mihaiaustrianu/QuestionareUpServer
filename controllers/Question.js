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

// Delete a question
router.delete("/:id", async (req, res) => {
  try {
    const questionId = req.params.id;
    const deletedQuestion = await Question.findByIdAndDelete(questionId);

    if (!deletedQuestion) {
      return res.status(404).json({ error: "The question does not exist" });
    }

    res.status(200).json({ message: "Succesfully deleted" }); // Success, no content
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the question" });
  }
});

// Update a question
router.put("/:id", async (req, res) => {
  try {
    const questionId = req.params.id;
    const { title, text, answers } = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { title, text, answers },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: "The question does not exist" });
    }

    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the question" });
  }
});

module.exports = router;
