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
  const { id: uid } = req.user!;
  const { id } = req.params;
  const categoryId = parseInt(id, 10);

  if (isNaN(categoryId)) {
    return res.status(400).json({ error: "Invalid category ID" });
  }

  try {
    const { rows } = await db.getById("categories", categoryId.toString(), uid);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const updateCategory: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const categoryId = parseInt(id, 10);

  if (isNaN(categoryId)) {
    return res.status(400).json({ error: "Invalid category ID" });
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const result = await db.updateById(
      "categories",
      { name: name.trim() },
      categoryId.toString()
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  createCategory,
  getCategoryById,
  updateCategory,
};
