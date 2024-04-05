import { RequestHandler } from "express";

export const getLongTerms: RequestHandler = (req, res, next) => {
  res.status(200).json("long term data");
};
