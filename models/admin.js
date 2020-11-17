const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  googleID: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Admin", adminSchema);
