import { RequestHandler } from "express";
import db from "../db/utils";

const createCategory: RequestHandler = async (req, res) => {
  const { userId: user_id, name } = req.body;
  try {
    res.status(201).send(await db.insert("categories", { user_id, name }));
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const getCategoryById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.getById("categories", id);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default {
  createCategory,
  getCategoryById,
};
