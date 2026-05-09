const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            user.name = profile.displayName || user.name;
            user.avatar = profile.photos?.[0]?.value || user.avatar;
            await user.save();
            return done(null, user);
          }

          user = await User.findOne({ email: profile.emails?.[0]?.value });

          if (user) {
            user.googleId = profile.id;
            user.avatar = profile.photos?.[0]?.value || user.avatar;
            await user.save();
            return done(null, user);
          }

          user = await User.create({
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || '',
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).lean();
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = configurePassport;
