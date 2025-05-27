import { RequestHandler } from "express";
import db from "../db/utils";

const createSubcategory: RequestHandler = async (req, res) => {
  const { categoryId: category_id, name } = req.body;
  try {
    res
      .status(201)
      .send(await db.insert("subcategories", { category_id, name }));
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const getSubcategoryById: RequestHandler = async (req, res) => {
  const { id: uid } = req.user!;
  const { id } = req.params;
  try {
    const { rows } = await db.getById("subcategories", id, uid);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default {
  createSubcategory,
  getSubcategoryById,
};
