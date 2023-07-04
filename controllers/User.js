require("dotenv").config(); // load .env variables
const { Router } = require("express"); // import router from express
const bcrypt = require("bcryptjs"); // import bcrypt to hash passwords
const jwt = require("jsonwebtoken"); // import jwt to sign tokens

const router = Router(); // create router to create route bundle

const { SECRET = "secret" } = process.env;

router.post("/signup", async (req, res) => {
  const { User } = req.context.models;
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const user = await User.create(req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/login", async (req, res) => {
  const { User } = req.context.models;
  try {
    const user = await User.findOne({ username: req.body.username });
    const userInfo = { username: user.username, id: user._id };
    if (user) {
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        const token = await jwt.sign({ username: user.username }, SECRET);
        res.json({ token, userInfo });
      } else {
        res.status(400).json({ error: "password doesn't match" });
      }
    } else {
      res.status(400).json({ error: "User doesn't exist" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
