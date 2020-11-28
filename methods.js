const Mentor = require("./models/mentor");
const Payment = require("./models/payment");
const PaymentsByDate = require("./models/paymentsByDate");
const staticData = require("./staticData.json");
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-adminSDK.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

async function sendNotifications(message, registrationTokens) {
  if (registrationTokens.length == 0) {
    console.log("tokens missing");
    return;
  }
  let response = await admin.messaging().sendMulticast({
    notification: {
      title: message.title,
      body: message.body,
      image: message.image,
    },
    tokens: registrationTokens,
  });
  console.log("Successfully sent message:", response);
}

function numberOfDaysBetween(first, second) {
  let one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
  let two = new Date(second.getFullYear(), second.getMonth(), second.getDate());

  let millisecondsPerDay = 1000 * 60 * 60 * 24;
  let millisBetween = two.getTime() - one.getTime();
  let days = millisBetween / millisecondsPerDay;

  return Math.floor(Math.abs(days));
}

async function payMentor(mentorID, menteeID, startDate, days) {
  if (days < 1) return;

  let date = new Date();
  let today = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  let todayEnd = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  );

  let paymentsByDate = await PaymentsByDate.findOne({
    date: { $gte: today, $lt: todayEnd },
  })
    .populate("payments")
    .exec();

  if (!paymentsByDate) {
    paymentsByDate = new PaymentsByDate({
      date: today,
    });
    await paymentsByDate.save();
    console.log("new paymentsByDate object");
  }

  for (let payment of paymentsByDate.payments) {
    if (payment.mentorID == mentorID && payment.menteeID == menteeID) {
      console.log(
        "Payment to mentor: " +
          mentorID +
          " for mentee: " +
          menteeID +
          " ran again. Exited."
      );
      return;
    }
  }

  let amount = Math.floor((days * staticData.mentorMonthlySalary) / 30);

  let payment = new Payment({
    mentorID: mentorID,
    menteeID: menteeID,
    amountPaid: amount,
    startDate: startDate,
    endDate: today,
  });

  let recipients = [];
  let mentor = await Mentor.findById(mentorID).exec();
  recipients = [...mentor.mobileTokens];
  if (mentor.webToken) recipients.push(mentor.webToken);
  await sendNotifications(
    {
      title: "Payment Received",
      body: "Amount of: Rs." + amount + " received",
    },
    recipients
  );

  await payment.save();

  console.log("new payment object");

  await Mentor.findByIdAndUpdate(mentorID, {
    $push: {
      payments: payment._id,
    },
  }).exec();

  console.log("mentor payment pushed");

  await paymentsByDate.payments.push(payment);
  await paymentsByDate.save();

  console.log("paymentsByDate updated");
}

module.exports = {
  sendNotifications,
  numberOfDaysBetween,
  payMentor,
};
