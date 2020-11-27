const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  mentorID: {
    type: String,
    required: true,
  },
  menteeID: {
    type: String,
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
