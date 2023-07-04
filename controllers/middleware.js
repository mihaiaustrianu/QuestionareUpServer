require("dotenv").config(); // loading env variables
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const QuestionSet = require("../models/QuestionSet");

// CREATE CONTEXT MIDDLEWARE
const createContext = (req, res, next) => {
  req.context = {
    models: {
      User,
      QuestionSet,
    },
  };
  next();
};

const isLoggedIn = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Optional chaining operator to handle missing authorization header

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    jwt.verify(token, process.env.SECRET, (error, decoded) => {
      if (error) {
        return res.status(401).json({ error: "Token verification failed" });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export custom middleware
module.exports = {
  isLoggedIn,
  createContext,
};
