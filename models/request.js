var mongoose = require("mongoose");

var requestSchema = mongoose.Schema(
  {
    menteeID: {
      type: String,
      default: "",
    },
    material: String,
    status: {
      type: String,
      enum: ["approved", "rejected", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
