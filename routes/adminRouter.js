const axios = require("axios");
require("dotenv").config();
const router = require("express").Router();
const checkAuth = require("../middleware/checkAuth");
const Mentee = require("../models/mentee");
const Mentor = require("../models/mentor");

router.get("/msg91-balance", checkAuth, async (req, res, next) => {
  try {
    let responses = await Promise.all([
      axios.get(
        "https://api.msg91.com/api/balance.php?authkey=" +
          process.env.msg91AuthKey +
          "&type=1"
      ),
      axios.get(
        "https://api.msg91.com/api/balance.php?authkey=" +
          process.env.msg91AuthKey +
          "&type=4"
      ),
      axios.get(
        "https://api.msg91.com/api/balance.php?authkey=" +
          process.env.msg91AuthKey +
          "&type=106"
      ),
    ]);

    res.status(200).json({
      promotional: responses[0].data,
      transactional: responses[1].data,
      sendOTP: responses[2].data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

router.post("/menteeSearch", checkAuth, async (req, res, next) => {
  try {
    if (
      !req.body.searchType ||
      !req.body.searchQuery ||
      !req.body.page ||
      !req.body.perPage
    ) {
      throw new Error(
        "searchType, searchQuery, page & perPage must be supplied"
      );
    }

    if (
      typeof req.body.page != "number" ||
      typeof req.body.perPage != "number"
    ) {
      throw new Error("page and perPage must be numbers");
    }

    let searchFields = [];
    const regex = new RegExp(escapeRegex(req.body.searchQuery), "gi");

    if (req.body.searchType == "name") {
      searchFields.push({ name: regex });
    } else if (req.body.searchType == "phone") {
      searchFields.push({ phone: regex });
    } else if (req.body.searchType == "email") {
      searchFields.push({ email: regex });
    } else {
      throw new Error("invalid searchType");
    }

    let responses = await Promise.all([
      Mentee.find({
        $or: searchFields,
      })
        .countDocuments()
        .exec(),
      Mentee.find({
        $or: searchFields,
      })
        .skip((req.body.page - 1) * req.body.perPage)
        .limit(req.body.perPage)
        .exec(),
    ]);

    let totalResults = responses[0];
    let results = responses[1];

    console.log(results);
    return res.status(200).json({
      totalResults,
      results,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
});

router.post("/mentorSearch", checkAuth, async (req, res, next) => {
  try {
    if (
      !req.body.searchType ||
      !req.body.searchQuery ||
      !req.body.page ||
      !req.body.perPage
    ) {
      throw new Error(
        "searchType, searchQuery, page & perPage must be supplied"
      );
    }

    if (
      typeof req.body.page != "number" ||
      typeof req.body.perPage != "number"
    ) {
      throw new Error("page and perPage must be numbers");
    }

    let searchFields = [];
    const regex = new RegExp(escapeRegex(req.body.searchQuery), "gi");

    if (req.body.searchType == "name") {
      searchFields.push({ name: regex });
    } else if (req.body.searchType == "phone") {
      searchFields.push({ phone: regex });
    } else if (req.body.searchType == "email") {
      searchFields.push({ email: regex });
    } else {
      throw new Error("invalid searchType");
    }

    let responses = await Promise.all([
      Mentor.find({
        $or: searchFields,
      })
        .countDocuments()
        .exec(),
      Mentor.find({
        $or: searchFields,
      })
        .skip((req.body.page - 1) * req.body.perPage)
        .limit(req.body.perPage)
        .exec(),
    ]);

    let totalResults = responses[0];
    let results = responses[1];

    console.log(results);
    return res.status(200).json({
      totalResults,
      results,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
});

module.exports = router;
