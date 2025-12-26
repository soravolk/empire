import passport from "passport";
import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const { id, email, name } = req.user as any;
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return res.status(500).send("JWT not configured");
    }

    const payload = {
      sub: id,
      email,
      name,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d",
      issuer: "empire",
    });

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("empire.jwt", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.redirect("/");
  }
);

router.get("/logout", (req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("empire.jwt", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });

  res.redirect("/");
});

export default router;
