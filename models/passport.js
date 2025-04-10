const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./user");
const bcrypt = require("bcrypt");

// Cấu hình chiến lược xác thực Local Strategy

passport.use(new LocalStrategy({ usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));


module.exports = passport;
