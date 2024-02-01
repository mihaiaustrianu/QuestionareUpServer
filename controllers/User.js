require("dotenv").config();
const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = Router();

const { SECRET = "secret" } = process.env;

router.post("/signup", async (req, res) => {
  try {
    const { User } = req.context.models;
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const user = await User.create(req.body);
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.username === 1
    ) {
      return res.status(400).json({
        error: "Username is already taken. Please choose a different username.",
      });
    }
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { User } = req.context.models;
    const { username, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate and return the token
    const token = jwt.sign({ userId: user._id }, SECRET, {
      expiresIn: "1h",
    });
    const userInfo = { username: user.username, id: user._id };
    res.json({ token, userInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
