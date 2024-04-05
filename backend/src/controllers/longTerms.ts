import { RequestHandler } from "express";
import pg from "../db/postgre";

const createLongTerm: RequestHandler = async (req, res) => {
  const { user_id } = req.body;
  try {
    await pg.query("INSERT INTO long_terms(user_id) VALUES ($1)", [user_id]);
    res.status(201);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const getLongTerms: RequestHandler = async (req, res) => {
  try {
    const { rows } = await pg.query("SELECT * FROM long_terms");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default { createLongTerm, getLongTerms };
