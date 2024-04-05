import { RequestHandler } from "express";
import pg from "../db/postgre";

export const getLongTerms: RequestHandler = async (req, res) => {
  const { rows } = await pg.query("SELECT * FROM long_terms");
  res.status(200).json(rows);
};
