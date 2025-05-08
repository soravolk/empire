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

const createDetail: RequestHandler = async (req, res) => {
  const { id: short_term_id } = req.params;
  const { contentId: content_id, name } = req.body;
  try {
    res.status(201).send(
      await db.insert("details", {
        content_id,
        short_term_id,
        name,
        time_spent: 0,
      })
    );
  } catch (error) {
    res.status(500).json({ error });
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

const getDetailsFromShortTerm: RequestHandler = async (req, res) => {
  const { id: short_term_id } = req.params;
  try {
    const { rows } = await db.getWithCondition("details", { short_term_id });
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default {
  createShortTerm,
  createDetail,
  getShortTerms,
  getDetailsFromShortTerm,
};
