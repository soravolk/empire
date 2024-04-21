import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import UserRoutes from "./routes/user";
import longTermRoutes from "./routes/longTerm";
import categoryRoutes from "./routes/category";
import subcategoryRoutes from "./routes/subcategory";
import contentRoutes from "./routes/content";
import cycleRoutes from "./routes/cycle";

const app: Express = express();
const allowedOrigins = ["http://localhost:3001"];
app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());
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
