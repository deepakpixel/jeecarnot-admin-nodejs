const mongoose = require("mongoose");

const paymentsByDateSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  payments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  ],
});

module.exports = mongoose.model("PaymentsByDate", paymentsByDateSchema);
