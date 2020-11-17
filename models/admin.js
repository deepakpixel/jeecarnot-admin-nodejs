const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: String,
  googleID: String,
});

module.exports = mongoose.model("Admin", adminSchema);
