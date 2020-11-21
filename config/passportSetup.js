require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/admin");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    let user = await User.findById(id).exec();
    if (user) {
      done(null, user);
    }
  } catch (error) {
    console.error(error);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refereshToken, profile, done) => {
      console.log("passport callback");
      try {
        let user = await User.findOne({ googleID: profile.id }).exec();
        if (!user && process.env.registerMode == "on") {
          user = new User({
            googleID: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            registeredOn: new Date(),
          });
          await user.save();
          console.log("user created" + user);
        } else if (!user) {
          console.error("User does not exist or registrations are not allowed");
          throw new Error(
            "User does not exist or registrations are not allowed"
          );
        }
        let currentLogin = user.currentLogin;
        await User.findByIdAndUpdate(user._id, {
          lastLogin: currentLogin,
          currentLogin: new Date(),
        }).exec();
        done(null, user);
      } catch (error) {
        console.error(error);
        done(error);
      }
    }
  )
);
