const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
  },
  lastLogin: {
    type: String,
  },
});

adminSchema.pre("save", async function (next) {
  if (!this.password) {
    let hashedPassword = await bcrypt.hash("admin", 10);
    this.password = hashedPassword;
  }
  next();
});

module.exports = mongoose.model("Admin", adminSchema);
