const mongoose = require("mongoose");
const Mentor = require("../models/mentor");
const numberOfDaysBetween = require("../methods").numberOfDaysBetween;
const payMentor = require("../methods").payMentor;

async function main() {
  try {
    let mentors = await Mentor.find().lean().exec();
    for (let mentor of mentors) {
      for (let mentee of mentor.mentees) {
        if (numberOfDaysBetween(mentee.assignedDate, new Date()) == 30) {
          await payMentor(mentor._id, mentee._id, mentee.assignedDate, 30);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
  mongoose.connection.close();
  console.log("paymentRoutine finished for " + new Date().toString());
}

mongoose.connect(
  "mongodb://localhost:27017/carnot",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  () => console.log("mongodb connected")
);

mongoose.connection.on(
  "error",
  console.error.bind(console, "MongoDB connection error")
);

main();
