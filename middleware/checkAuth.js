const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) throw new Error();
    const token = req.cookies.token;
    jwt.verify(token, process.env.jwtKey);
    next();
  } catch (error) {
    console.log("checkauth failed");
    res.redirect('/auth/password');
  }
};
