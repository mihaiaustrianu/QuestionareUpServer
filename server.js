require("dotenv").config(); // load .env variables
const express = require("express"); // import express
const morgan = require("morgan"); //import morgan
const { log } = require("mercedlogger"); // import mercedlogger's log function
const cors = require("cors"); // import cors

const UserRouter = require("./controllers/User");
const QuestionSetRouter = require("./controllers/QuestionSet");
const QuestionRouter = require("./controllers/Question");
const { createContext } = require("./controllers/middleware");

//DESTRUCTURE ENV VARIABLES WITH DEFAULT VALUES
const { PORT = 3000 } = process.env;

// Create Application Object
const app = express();

// Global middelware
app.use(cors()); // add cors headers
app.use(morgan("tiny")); // log the request for debugging
app.use(express.json()); // parse json bodies
app.use(createContext); // create req.context

// Routers
app.use("/user", UserRouter);
app.use("/api/question-sets", QuestionSetRouter);
app.use("/api/questions", QuestionRouter);

// listeners
app.listen(PORT, () => log.green("SERVER STATUS", `Listening on port ${PORT}`));
