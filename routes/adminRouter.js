const axios = require("axios");
require("dotenv").config();
const router = require("express").Router();
const checkAuth = require("../middleware/checkAuth");

router.get("/msg91-balance", checkAuth, (req, res, next) => {
  let responses = [];

  axios
    .all([
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
    ])
    .then(
      axios.spread((response1, response2, response3) => {
        res.status(200).json({
          promotional: response1.data,
          transactional: response2.data,
          sendOTP: response3.data,
        });
      })
    )
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        type: "error",
        message: error.message,
      });
    });
});

module.exports = router;
