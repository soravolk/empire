import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import user from "../controllers/user";

passport.serializeUser((user, done) => {
  done(null, user);
});

// TODO: should use custom User type
passport.deserializeUser((user: any, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      let loginUser;
      try {
        loginUser = await user.getUserById(profile.id);
      } catch (error) {
        return done(new Error("failed to get user information"), undefined);
      }

      if (!loginUser && profile.emails) {
        try {
          await user.createUser(
            profile.id,
            profile.emails[0].value,
            profile.displayName
          );
          loginUser = await user.getUserById(profile.id);
        } catch (error) {
          return done(new Error("failed to create a new user"), undefined);
        }
      }
      return done(null, loginUser);
    }
  )
);
