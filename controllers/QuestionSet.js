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

module.exports = router;
