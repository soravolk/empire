import { RequestHandler } from "express";
import db from "../db/utils";

const createShortTerm: RequestHandler = async (req, res) => {
  const { userId: user_id } = req.body;
  try {
    await db.insert("short_terms", { user_id });
    res.status(201).end();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const getShortTerms: RequestHandler = async (req, res) => {
  try {
    const { rows } = await db.getAll("short_terms");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default { createShortTerm, getShortTerms };
