const { Router } = require("express");
const { isLoggedIn } = require("./middleware");

const router = Router();

router.use(isLoggedIn);

const QuestionSet = require("../models/QuestionSet");

router.post("/create", async (req, res) => {
  const { title, description } = req.body;

  const { userId } = req.user;
  try {
    const existingQuestionSet = await QuestionSet.findOne({ userId, title });

    if (existingQuestionSet) {
      return res
        .status(400)
        .json({ error: "A question set with the same title already exists" });
    }

    const questionSet = new QuestionSet({
      userId,
      title,
      description,
    });
    console.log(questionSet);
    await questionSet.save();

    res.status(201).json(questionSet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create question set" });
  }
});

// Gets all the user's questions sets
router.get("/", async (req, res) => {
  const { userId } = req.user;
  try {
    const questionSets = await QuestionSet.find({ userId });

    if (questionSets) {
      return res.status(200).json(questionSets);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get question sets" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const questionSet = await QuestionSet.findByIdAndDelete(id);
    if (!questionSet) {
      return res.status(404).json({ error: "The question set does not exist" });
    }
    res.status(200).json({ message: "Succesfully deleted" }); // Success, no content
  } catch (error) {
    res.status(500).json({ error: "Failed to delete question set" });
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { title, description } = req.body;

  try {
    const questionSet = await QuestionSet.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );

    if (!questionSet) {
      return res.status(404).json({ error: "The question set does not exist" });
    }
    console.log(questionSet);
    res.status(200).json(questionSet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update question set" });
  }
});

module.exports = router;
