import express, { Express } from "express";
import cors from "cors";
import passport from "passport";
import "./services/auth"; // Google strategy (stateless)
import AuthRoutes from "./routes/auth";

export async function createAuthApp(): Promise<Express> {
  const app = express();

  const allowedOrigins = [process.env.FRONTEND_URL || ""];
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  app.use(passport.initialize());
  app.use(express.json());
  // Only auth routes here; no DB init or protected routes
  app.use("/auth", AuthRoutes);

  return app;
}
