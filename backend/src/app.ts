import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import AuthRoutes from "./routes/auth";
import UserRoutes from "./routes/user";
import longTermRoutes from "./routes/longTerm";
import categoryRoutes from "./routes/category";
import subcategoryRoutes from "./routes/subcategory";
import contentRoutes from "./routes/content";
import cycleRoutes from "./routes/cycle";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import "./services/auth";

const app: Express = express();
const allowedOrigins = ["http://localhost:3001"];
app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // TODO: https
  })
);

app.use(passport.initialize());

app.use(express.json());
app.use("/auth", AuthRoutes);
app.use("/users", UserRoutes);
app.use("/longTerms", longTermRoutes);
app.use("/categories", categoryRoutes);
app.use("/subcategories", subcategoryRoutes);
app.use("/contents", contentRoutes);
app.use("/cycles", cycleRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ message: err.message });
});

app.listen(3000);
