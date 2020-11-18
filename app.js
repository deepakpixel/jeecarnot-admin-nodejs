require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const authRouter = require("./routes/authRouter");
const passportSetup = require("./config/passportSetup");
const passport = require("passport");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const checkAuth = require("./middleware/checkAuth");

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.cookieKey],
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());

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

app.get("/profile", checkAuth, (req, res) => {
  res.render("profile");
});

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});

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
