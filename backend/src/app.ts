import express, { Express, Request, Response, NextFunction } from "express";
import UserRoutes from "./routes/user";
import longTermRoutes from "./routes/longTerm";
import categoryRoutes from "./routes/category";

const app: Express = express();

app.use(express.json());
app.use("/users", UserRoutes);
app.use("/longTerms", longTermRoutes);
app.use("/categories", categoryRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ message: err.message });
});

app.listen(3000);
