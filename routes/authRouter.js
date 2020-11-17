const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/admin");

router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("password");
  }
  res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  res.redirect("/auth/password");
});

router.get("/password", (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("login");
  }
  res.render("password");
});

router.post("/password", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      throw new Error("User not authenticated");
    }
    if (req.body.password == "") {
      throw new Error("Password field cannot be empty");
    }
    if (req.user.password == "") {
      console.log("new password");
      await User.findByIdAndUpdate(req.user._id, {
        password: req.body.password,
      }).exec();

      req.logout();
      res.status(200).json({
        type: "success",
        message:
          "Password saved. Login again at http://localhost:3000/auth/login",
      });
    } else if (req.user.password == req.body.password) {
      console.log("passwords matched");
      const token = jwt.sign(
        {
          ...req.user,
        },
        process.env.jwtKey,
        {
          expiresIn: "1h",
        }
      );
      res.cookie("token", token);
      res.status(200).json({
        type: "success",
        message: "password verified",
      });
    } else {
      console.log("passwords dont match");
      throw new Error("Incorrect Password");
    }
  } catch (error) {
    res.status(500).json({
      type: "error",
      error: error.message,
    });
  }
});

module.exports = router;
