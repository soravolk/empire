import { RequestHandler } from "express";
import db from "../db/utils";

const createCategory: RequestHandler = async (req, res) => {
  const { userId: user_id, name } = req.body;
  try {
    await db.insert("categories", { user_id, name });
    res.status(201).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const getCategories: RequestHandler = async (req, res) => {
  try {
    const { rows } = await db.getAll("categories");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const deleteCategory: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteById("categories", id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default { createCategory, getCategories, deleteCategory };
