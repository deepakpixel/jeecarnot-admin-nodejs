const router = require("express").Router();
const passport = require("passport");
const checkAuth = require("../middleware/checkAuth");
const authController = require("../controllers/authController");

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

router.post("/change-password", checkAuth, authController.changePassword);

router.get("/password", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("login");
  }
  res.render("password");
});

router.post("/password", authController.verifyPassword);

module.exports = router;
