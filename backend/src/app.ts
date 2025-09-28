import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import passport from "passport";
import session, { CookieOptions } from "express-session";
import cors from "cors";
import AuthRoutes from "./routes/auth";
import UserRoutes from "./routes/user";
import longTermRoutes from "./routes/longTerm";
import shortTermRoutes from "./routes/shortTerm";
import categoryRoutes from "./routes/category";
import subcategoryRoutes from "./routes/subcategory";
import contentRoutes from "./routes/content";
import taskRoutes from "./routes/task";
import cycleRoutes from "./routes/cycle";
import goalRoutes from "./routes/goal";
import { checkAuthentication } from "./middleware/auth";
import { init as dbInit, pg } from "./db/postgre";

import "./services/auth";

async function start() {
  const app: Express = express();
  const allowedOrigins = [process.env.FRONTEND_URL || ""];

  const sessionConfig = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    } as CookieOptions,
  };

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
    sessionConfig.cookie.secure = true;
    sessionConfig.cookie.sameSite = "none";
    sessionConfig.cookie.httpOnly = true;
  }

  app.use(session(sessionConfig));

  app.use((req, res, next) => {
    const cf = req.headers["cloudfront-forwarded-proto"];
    if (cf) req.headers["x-forwarded-proto"] = cf;
    next();
  });

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(express.json());
  app.use("/auth", AuthRoutes);
  app.use(checkAuthentication);
  app.use("/users", UserRoutes);
  app.use("/longTerms", longTermRoutes);
  app.use("/shortTerms", shortTermRoutes);
  app.use("/categories", categoryRoutes);
  app.use("/subcategories", subcategoryRoutes);
  app.use("/contents", contentRoutes);
  app.use("/tasks", taskRoutes);
  app.use("/cycles", cycleRoutes);
  app.use("/goals", goalRoutes);

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ message: err.message });
  });

  const PORT = process.env.PORT;
  app.listen(PORT);

  await dbInit();
  if (pg === undefined) {
    throw new Error("db undefined");
  }
}

start().catch((err) => {
  console.error("Failed to start app:", err);
  process.exit(1);
});
