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
      console.log(profile);
      try {
        let user = await User.findOne({ googleID: profile.id }).exec();
        if (user) {
          console.log("user found" + user);
        } else {
          if (process.env.registerMode == "on") {
            user = new User({
              googleID: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
            });
            await user.save();
            console.log("user created" + user);
          } else {
            console.error("User does not exist");
            throw new Error("User does not exist");
          }
        }
        done(null, user);
      } catch (error) {
        console.error(error);
        done(error);
      }
    }
  )
);
