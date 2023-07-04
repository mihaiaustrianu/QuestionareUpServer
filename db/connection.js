require("dotenv").config();
const mongoose = require("mongoose");
const { log } = require("mercedlogger");

//DESTRUCTURE ENV VARIABLES
const { DATABASE_URL } = process.env;

// CONNECT TO MONGO
mongoose.connect = mongoose.connect(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// CONNECTION EVENTS
mongoose.connection
  .on("open", () => log.green("DATABASE STATE", "Connection Open"))
  .on("close", () => log.magenta("DATABASE STATE", "Connection Open"))
  .on("error", (error) => log.red("DATABASE STATE", error));

// EXPORT CONNECTION
module.exports = mongoose;
