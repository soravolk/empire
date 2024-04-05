import express, { Express, Request, Response, NextFunction } from "express";
import longTermRoutes from "./routes/longTerms";
import UserRoutes from "./routes/users";

const app: Express = express();

app.use(express.json());
app.use("/longTerms", longTermRoutes);
app.use("/users", UserRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ message: err.message });
});

app.listen(3000);
