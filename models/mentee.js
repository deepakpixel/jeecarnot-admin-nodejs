var mongoose = require("mongoose");
var Notifications = require("./notification");
var MenteeSchema = mongoose.Schema(
  {
    name: String,
    password: String,
    username: String,
    phone: String,
    emailVerification: {
      type: Boolean,
      default: false,
    },
    profileVerification: {
      type: Boolean,
      default: false,
    },
    alternatephone: {
      type: String,
      default: "",
    },
    parentname: {
      type: String,
      default: "",
    },
    parentPhone: {
      type: String,
      default: "",
    },
    class: {
      type: String,
      default: "",
    },
    lastAttemptJeeYear: {
      type: String,
      default: "",
    },
    lastAttemptJeepercentile: {
      type: String,
      default: "",
    },
    targetYear: {
      type: String,
      default: "",
    },
    modePreparation: {
      type: String,
      default: "self",
    },
    otherTargetExams: {
      type: String,
      default: "",
    },
    firstHear: {
      type: String,
      default: "",
    },
    whyWant: {
      type: String,
      default: "",
    },
    expectations: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "english",
    },
    materialRequirement: {
      type: String,
      default: "",
    },
    access: [String],
    plan: {
      type: String,
      default: "none",
    },
    planID: {
      type: String,
      default: "none",
    },
    notifications: [Notifications],
    requests: [String],
    tickets: [String],
    payments: [String],
    mentorID: {
      type: String,
      default: "none",
    },
    mentorAssign: {
      type: String,
      default: "none",
    },
    pastMentors: [
      {
        mentorID: String,
        assignedDate: Date,
      },
    ],
    webToken: String,
    mobileTokens: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mentee", MenteeSchema);
