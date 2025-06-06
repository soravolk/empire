import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import AuthRoutes from "./routes/auth";
import UserRoutes from "./routes/user";
import longTermRoutes from "./routes/longTerm";
import shortTermRoutes from "./routes/shortTerm";
import categoryRoutes from "./routes/category";
import subcategoryRoutes from "./routes/subcategory";
import contentRoutes from "./routes/content";
import detailRoutes from "./routes/detail";
import cycleRoutes from "./routes/cycle";
import { checkAuthentication } from "./middleware/auth";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import "./services/auth";

const app: Express = express();
const allowedOrigins = [process.env.FRONTEND_URL || ""];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // TODO: set to true ASAP
    },
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
app.use("/details", detailRoutes);
app.use("/cycles", cycleRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT;
app.listen(PORT);
