import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

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
      callbackURL: `${process.env.FRONTEND_URL}/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      // Stateless: don't touch DB here; just return minimal identity info
      const minimal = {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        picture: (profile.photos && profile.photos[0]?.value) || undefined,
        provider: profile.provider,
      };
      return done(null, minimal as any);
    }
  )
);
