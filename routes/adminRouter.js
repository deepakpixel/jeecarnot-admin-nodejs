require("dotenv").config();
const router = require("express").Router();
const checkAuth = require("../middleware/checkAuth");
const adminController = require("../controllers/adminController");

router.get("/msg91-balance", checkAuth, adminController.getMSG91Balance);

router.post("/mentee-search", checkAuth, adminController.menteeSearch);

router.post("/mentor-search", checkAuth, adminController.mentorSearch);

router.post("/add-web-token", checkAuth, adminController.addWebToken);

router.post("/add-mobile-token", checkAuth, adminController.addMobileToken);

router.post("/assign-mentor", checkAuth, adminController.assignMentor);

router.get("/mentee/:id", checkAuth, adminController.getMentee);

router.get("/mentor/:id", checkAuth, adminController.getMentor);

module.exports = router;
