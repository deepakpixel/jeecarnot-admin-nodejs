const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/admin");
const checkAuth = require("../middleware/checkAuth");

router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("password");
  }
  res.render("login");
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  res.redirect("/auth/password");
});

router.get("/change-password", checkAuth, (req, res) => {
  res.render("changePassword");
});

router.post("/change-password", checkAuth, async (req, res) => {
  try {
    if (req.body.password == "") {
      throw new Error("Password field cannot be empty");
    }
    if (!req.user) {
      throw new Error("User data unavailable");
    }
    let id = req.user._id;
    console.log("new password");

    await bcrypt.hash(req.body.password, 10, async (err, hash) => {
      if (err) {
        throw err;
      } else {
        await User.findByIdAndUpdate(id, {
          password: hash,
        }).exec();
      }
    });

    req.logout();
    res.status(200).json({
      type: "success",
      message:
        "Password changed. Login again at http://localhost:3000/auth/login",
    });
  } catch (error) {
    res.status(500).json({
      type: "error",
      error: error.message,
    });
  }
});

router.get("/password", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("login");
  }
  res.render("password");
});

router.post("/password", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    await bcrypt.compare(
      req.body.password,
      req.user.password,
      (err, result) => {
        if (err) {
          throw err;
        }
        if (result === true) {
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
          return res.status(200).json({
            type: "success",
            message: "password verified",
          });
        } else {
          return res.status(500).json({
            type: "error",
            error: "incorrect password",
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json({
      type: "error",
      error: error.message,
    });
  }
});

module.exports = router;
