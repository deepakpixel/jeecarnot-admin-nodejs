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
      assignedDate: Date,
    },
  ],
  webToken: String,
  mobileTokens: [String],
  payments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  ],
});

module.exports = mongoose.model("Mentor", MentorSchema);
