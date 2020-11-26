var mongoose = require("mongoose");
var MentorSchema = mongoose.Schema({
  name: String,
  password: String,
  username: String,
  phone: String,
  whatsapp: String,
  college: String,
  mentees: [
    {
      menteeID: String,
      assignedDate: String,
    },
  ],
  webToken: String,
  mobileTokens: [String],
});

module.exports = mongoose.model("Mentor", MentorSchema);
