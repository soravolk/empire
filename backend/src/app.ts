import express, { Express, Request, Response, NextFunction } from "express";
import longTermRoutes from "./routes/longTerms";

const app: Express = express();

app.use("/longTerms", longTermRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ message: err.message });
});

app.listen(3000);
