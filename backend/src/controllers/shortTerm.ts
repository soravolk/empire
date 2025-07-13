import { RequestHandler } from "express";
import db from "../db/utils";

const createShortTerm: RequestHandler = async (req, res) => {
  const { userId: user_id } = req.body;
  try {
    res.status(201).send(await db.insert("short_terms", { user_id }));
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
  const { id: uid } = req.user!;
  try {
    const { rows } = await db.getAll("short_terms", uid);
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

const updateDetailTimeSpent: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { timeSpent: time_spent } = req.body;
  try {
    const result = await db.updateById("details", { time_spent }, id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
};

const updateDetailFinishedDate: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { finishedDate: finished_date } = req.body;
  try {
    const result = await db.updateById("details", { finished_date }, id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
};

const deleteShortTerm: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteById("short_terms", id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const deleteShortTermDetail: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteById("details", id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default {
  createShortTerm,
  createDetail,
  getShortTerms,
  getDetailsFromShortTerm,
  updateDetailTimeSpent,
  updateDetailFinishedDate,
  deleteShortTerm,
  deleteShortTermDetail,
};
