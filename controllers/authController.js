const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/admin");

exports.changePassword = async (req, res) => {
  try {
    if (req.body.newPassword == "") {
      throw new Error("Password field cannot be empty");
    }
    if (!req.user) {
      throw new Error("User data unavailable");
    }
    let result = await bcrypt.compare(req.body.oldPassword, req.user.password);
    if (!result) {
      throw new Error("old password incorrect");
    }
    console.log("new password");

    let hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    await User.findByIdAndUpdate(req.user._id, {
      password: hashedPassword,
    }).exec();

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
};

exports.verifyPassword = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    let result = await bcrypt.compare(req.body.password, req.user.password);
    let token;
    if (result === true) {
      console.log("passwords matched");
      try {
        token = req.cookies.token;
        jwt.verify(token, process.env.jwtKey);
        console.log("token valid");
      } catch (error) {
        console.log("new token");
        token = jwt.sign(
          {
            id: req.user._id,
          },
          process.env.jwtKey,
          {
            expiresIn: "1h",
          }
        );
      }

      res.cookie("token", token);
      return res.status(200).json({
        type: "success",
        message: "password verified",
      });
    } else {
      throw new Error("incorrect password");
    }
  } catch (error) {
    res.status(500).json({
      type: "error",
      error: error.message,
    });
  }
};
