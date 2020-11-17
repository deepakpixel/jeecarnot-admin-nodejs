require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const authRouter = require("./routes/authRouter");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(morgan("dev"));

mongoose.connect(
  "mongodb://localhost:27017/carnot",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  () => console.log("mongodb connected")
);

mongoose.connection.on(
  "error",
  console.error.bind(console, "MongoDB connection error")
);

app.use("/auth", authRouter);

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    type: "error",
    error: error.message,
  });
});

module.exports = app;
