import { RequestHandler } from "express";
import db from "../db/utils";

const createLongTerm: RequestHandler = async (req, res) => {
  const {
    userId: user_id,
    startTime: start_time,
    endTime: end_time,
  } = req.body;
  try {
    await db.insert("long_terms", { user_id, start_time, end_time });
    res.status(201).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const getLongTerms: RequestHandler = async (req, res) => {
  try {
    const { rows } = await db.getAll("long_terms");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default { createLongTerm, getLongTerms };
