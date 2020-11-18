const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  googleID: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    default: "$2b$10$uWhFpJMB1rJUyyw6Kjz6fOYgZN16DIa/rxvQHL2NB68UQU/8u9iMK",
  },
});

module.exports = mongoose.model("Admin", adminSchema);
