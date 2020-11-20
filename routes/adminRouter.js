require("dotenv").config();
const router = require("express").Router();
const checkAuth = require("../middleware/checkAuth");
const adminController = require("../controllers/adminController");

router.get("/msg91-balance", checkAuth, adminController.getMSG91Balance);

router.post("/menteeSearch", checkAuth, adminController.menteeSearch);

router.post("/mentorSearch", checkAuth, adminController.mentorSearch);

module.exports = router;
