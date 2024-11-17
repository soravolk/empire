import { RequestHandler } from "express";
import db from "../db/utils";

const getShortTerms: RequestHandler = async (req, res) => {
  try {
    const { rows } = await db.getAll("short_terms");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default { getShortTerms };
