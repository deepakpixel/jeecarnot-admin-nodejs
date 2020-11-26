const axios = require("axios");
const Mentee = require("../models/mentee");
const Mentor = require("../models/mentor");
const AssignMentor = require("../models/assignMentor");
const Feedback = require("../models/feedback");
const Request = require("../models/request");
const admin = require("firebase-admin");
const serviceAccount = require("../firebase-adminSDK.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

exports.getMSG91Balance = async (req, res, next) => {
  try {
    let responses = await Promise.all([
      axios.get(
        "https://api.msg91.com/api/balance.php?authkey=" +
          process.env.msg91AuthKey +
          "&type=1"
      ),
      axios.get(
        "https://api.msg91.com/api/balance.php?authkey=" +
          process.env.msg91AuthKey +
          "&type=4"
      ),
      axios.get(
        "https://api.msg91.com/api/balance.php?authkey=" +
          process.env.msg91AuthKey +
          "&type=106"
      ),
    ]);

    res.status(200).json({
      promotional: responses[0].data,
      transactional: responses[1].data,
      sendOTP: responses[2].data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

exports.menteeSearch = async (req, res, next) => {
  try {
    if (
      !req.body.searchType ||
      !req.body.searchQuery ||
      !req.body.page ||
      !req.body.perPage
    ) {
      throw new Error(
        "searchType, searchQuery, page & perPage must be supplied"
      );
    }

    if (
      typeof req.body.page != "number" ||
      typeof req.body.perPage != "number"
    ) {
      throw new Error("page and perPage must be numbers");
    }

    let searchFields = [];
    const regex = new RegExp(escapeRegex(req.body.searchQuery), "gi");

    if (req.body.searchType == "name") {
      searchFields.push({ name: regex });
    } else if (req.body.searchType == "phone") {
      searchFields.push({ phone: regex });
    } else if (req.body.searchType == "email") {
      searchFields.push({ email: regex });
    } else {
      throw new Error("invalid searchType");
    }

    let responses = await Promise.all([
      Mentee.find({
        $or: searchFields,
      })
        .countDocuments()
        .exec(),
      Mentee.find({
        $or: searchFields,
      })
        .skip((req.body.page - 1) * req.body.perPage)
        .limit(req.body.perPage)
        .exec(),
    ]);

    let totalResults = responses[0];
    let results = responses[1];

    console.log(results);
    return res.status(200).json({
      totalResults,
      results,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

exports.mentorSearch = async (req, res, next) => {
  try {
    if (
      !req.body.searchType ||
      !req.body.searchQuery ||
      !req.body.page ||
      !req.body.perPage
    ) {
      throw new Error(
        "searchType, searchQuery, page & perPage must be supplied"
      );
    }

    if (
      typeof req.body.page != "number" ||
      typeof req.body.perPage != "number"
    ) {
      throw new Error("page and perPage must be numbers");
    }

    let searchFields = [];
    const regex = new RegExp(escapeRegex(req.body.searchQuery), "gi");

    if (req.body.searchType == "name") {
      searchFields.push({ name: regex });
    } else if (req.body.searchType == "phone") {
      searchFields.push({ phone: regex });
    } else if (req.body.searchType == "email") {
      searchFields.push({ email: regex });
    } else {
      throw new Error("invalid searchType");
    }

    let responses = await Promise.all([
      Mentor.find({
        $or: searchFields,
      })
        .countDocuments()
        .exec(),
      Mentor.find({
        $or: searchFields,
      })
        .skip((req.body.page - 1) * req.body.perPage)
        .limit(req.body.perPage)
        .exec(),
    ]);

    let totalResults = responses[0];
    let results = responses[1];

    console.log(results);
    return res.status(200).json({
      totalResults,
      results,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

async function sendNotifications(message, registrationTokens) {
  if (registrationTokens.length == 0) {
    throw new Error("tokens missing");
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

exports.sendNotification = async (req, res, next) => {
  try {
    if (!req.body.type || !req.body.id || !req.body.title || !req.body.body) {
      throw new Error("type, id, title, body must be given");
    }
    let recipients = [];
    if (req.body.type == "mentee") {
      let mentee = await Mentee.findById(req.body.id).exec();
      recipients = [...mentee.mobileTokens];
      if (mentee.webToken) recipients.push(mentee.webToken);
    } else if (req.body.type == "mentor") {
      let mentor = await Mentor.findById(req.body.id).exec();
      recipients = [...mentor.mobileTokens];
      if (mentor.webToken) recipients.push(mentor.webToken);
    } else {
      throw new Error("type must be mentee or mentor");
    }

    await sendNotifications(
      {
        title: req.body.title,
        body: req.body.body,
        image: req.body.image,
      },
      recipients
    );

    res.status(200).json({
      type: "success",
      message: "Notifications sent",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

exports.assignMentor = async (req, res, next) => {
  try {
    if (!req.body.menteeID || !req.body.mentorID) {
      throw new Error("menteeID and mentorID must be given");
    }

    let mentee = await Mentee.findById(req.body.menteeID).exec();
    if (!mentee) {
      throw new Error("Mentee does not exist");
    }
    if (mentee.mentorID != "none") {
      throw new Error("Mentor is already assigned");
    }

    let mentor = await Mentor.findById(req.body.mentorID).exec();
    if (!mentor) {
      throw new Error("Mentor does not exist");
    }

    mentee = await Mentee.findByIdAndUpdate(req.body.menteeID, {
      mentorID: req.body.mentorID,
      $push: {
        pastMentors: {
          mentorID: req.body.mentorID,
          assignedDate: new Date(),
        },
      },
    }).exec();

    mentor = await Mentor.findByIdAndUpdate(req.body.mentorID, {
      $push: {
        mentees: {
          menteeID: req.body.menteeID,
          assignedDate: new Date(),
        },
      },
    }).exec();

    await AssignMentor.deleteOne({ menteeID: req.body.menteeID }).exec();

    let menteeNotification = {
      title: "Mentor Assigned",
      body: "You have been assigned " + mentor.name + " as a mentor",
    };

    let menteeRecipients = [...mentee.mobileTokens];
    if (mentee.webToken) menteeRecipients.push(mentee.webToken);

    await sendNotifications(menteeNotification, menteeRecipients);

    let mentorNotification = {
      title: "Mentee Assigned",
      body: "You have been assigned " + mentee.name + " as a mentee",
    };

    let mentorRecipients = [...mentor.mobileTokens];
    if (mentor.webToken) mentorRecipients.push(mentor.webToken);

    await sendNotifications(mentorNotification, mentorRecipients);

    res.status(200).json({
      type: "success",
      message: "Mentor Assigned Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

exports.getMentee = async (req, res, next) => {
  try {
    if (!req.params.id) {
      throw new Error("id not given");
    }
    let mentee = await Mentee.findById(req.params.id);
    if (!mentee) {
      throw new Error("Mentee not found");
    }
    res.status(200).json({
      type: "success",
      mentee,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

exports.getMentor = async (req, res, next) => {
  try {
    if (!req.params.id) {
      throw new Error("id not given");
    }
    let mentor = await Mentor.findById(req.params.id).exec();
    if (!mentor) {
      throw new Error("Mentor not found");
    }
    res.status(200).json({
      type: "success",
      mentor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

exports.addWebToken = async (req, res, next) => {
  try {
    if (!req.body.type || !req.body.id || !req.body.token) {
      throw new Error("type, id and token must be supplied");
    }

    if (req.body.type == "mentee") {
      await Mentee.findByIdAndUpdate(req.body.id, {
        webToken: req.body.token,
      }).exec();
    } else if (req.body.type == "mentor") {
      await Mentor.findByIdAndUpdate(req.body.id, {
        webToken: req.body.token,
      }).exec();
    } else {
      throw new Error("type must be mentee or mentor");
    }
    res.status(200).json({
      type: "success",
      message: "Token Added",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

exports.addMobileToken = async (req, res, next) => {
  try {
    if (!req.body.type || !req.body.id || !req.body.token) {
      throw new Error("type, id and token must be supplied");
    }

    if (req.body.type == "mentee") {
      await Mentee.findByIdAndUpdate(req.body.id, {
        $push: {
          mobileTokens: req.body.token,
        },
      }).exec();
    } else if (req.body.type == "mentor") {
      await Mentor.findByIdAndUpdate(req.body.id, {
        $push: {
          mobileTokens: req.body.token,
        },
      }).exec();
    } else {
      throw new Error("type must be mentee or mentor");
    }
    res.status(200).json({
      type: "success",
      message: "Token Added",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

exports.changeMentor = async (req, res, next) => {
  try {
    if (!req.body.menteeID || !req.body.mentorID) {
      throw new Error("menteeID and mentorID must be given");
    }

    let mentee = await Mentee.findById(req.body.menteeID).exec();
    if (!mentee) {
      throw new Error("Mentee does not exist");
    }

    let mentor = await Mentor.findById(req.body.mentorID).exec();
    if (!mentor) {
      throw new Error("Mentor does not exist");
    }

    await Mentor.findByIdAndUpdate(mentee.mentorID, {
      $pull: {
        mentees: {
          menteeID: req.body.menteeID,
        },
      },
    }).exec();

    await Mentor.findByIdAndUpdate(req.body.mentorID, {
      $push: {
        mentees: {
          menteeID: req.body.menteeID,
          assignedDate: new Date(),
        },
      },
    }).exec();

    await Mentee.findByIdAndUpdate(req.body.menteeID, {
      mentorID: req.body.mentorID,
      $push: {
        pastMentors: {
          mentorID: req.body.mentorID,
          assignedDate: new Date(),
        },
      },
    }).exec();

    let menteeNotification = {
      title: "Mentor Changed",
      body: "You have been assigned " + mentor.name + " as a mentor",
    };

    let menteeRecipients = [...mentee.mobileTokens];
    if (mentee.webToken) menteeRecipients.push(mentee.webToken);

    await sendNotifications(menteeNotification, menteeRecipients);

    let mentorNotification = {
      title: "Mentee Assigned",
      body: "You have been assigned " + mentee.name + " as a mentee",
    };

    let mentorRecipients = [...mentor.mobileTokens];
    if (mentor.webToken) mentorRecipients.push(mentor.webToken);

    await sendNotifications(mentorNotification, mentorRecipients);

    res.status(200).json({
      type: "success",
      message: "Mentor Changed Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

exports.fetchFeedback = async (req, res, next) => {
  try {
    if (!req.body.type || !req.body.page || !req.body.perPage) {
      throw new Error("type, page & perPage must be supplied");
    }

    if (
      typeof req.body.page != "number" ||
      typeof req.body.perPage != "number"
    ) {
      throw new Error("page and perPage must be numbers");
    }

    let responses = [];
    if (req.body.type == "all") {
      responses = await Promise.all([
        Feedback.find().countDocuments().exec(),
        Feedback.find()
          .skip((req.body.page - 1) * req.body.perPage)
          .limit(req.body.perPage)
          .exec(),
      ]);
    } else if (
      req.body.type == "critical" ||
      req.body.type == "pending" ||
      req.body.type == "resolved"
    ) {
      responses = await Promise.all([
        Feedback.find({
          status: req.body.type,
        })
          .countDocuments()
          .exec(),
        Feedback.find({
          status: req.body.type,
        })
          .skip((req.body.page - 1) * req.body.perPage)
          .limit(req.body.perPage)
          .exec(),
      ]);
    } else {
      throw new Error("type must be all, critical, pending or resolved");
    }

    let totalResults = responses[0];
    let results = responses[1];

    console.log(results);
    return res.status(200).json({
      totalResults,
      results,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

exports.fetchMentors = async (req, res, next) => {
  try {
    let mentors = await Mentor.find().exec();
    res.status(200).json({
      totalResults: mentors.length,
      results: mentors.map((mentor) => {
        return {
          name: mentor.name,
          college: mentor.college,
          mentees: mentor.mentees.length,
        };
      }),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

exports.updateMaterialRequest = async (req, res, next) => {
  try {
    if (!req.body.id || !req.body.status) {
      throw new Error("id and status must be given");
    }
    if (req.body.status != "approved" && req.body.status != "rejected") {
      throw new Error("status must be approved or rejected");
    }

    let request = await Request.findByIdAndUpdate(req.body.id, {
      status: req.body.status,
    }).exec();

    if (!request) {
      throw new Error("Request object does not exist");
    }

    let mentee = await Mentee.findById(request.menteeID).exec();
    if (!mentee) {
      throw new Error("Mentee does not exist");
    }

    let recipients = [...mentee.mobileTokens];
    if (mentee.webToken) recipients.push(mentee.webToken);

    let message = {
      title: "Material Request: " + req.body.status,
      body: request.material,
    };

    await sendNotifications(message, recipients);

    res.status(200).json({
      type: "success",
      message: message.title,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};
