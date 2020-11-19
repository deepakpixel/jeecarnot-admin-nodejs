const axios = require("axios");
require("dotenv").config();
const router = require("express").Router();
const checkAuth = require("../middleware/checkAuth");

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

module.exports = router;
