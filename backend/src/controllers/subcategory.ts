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

const getSubcategories: RequestHandler = async (req, res) => {
  try {
    const { rows } = await db.getAll("subcategories");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const deleteSubcategory: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteById("subcategories", id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default { createSubcategory, getSubcategories, deleteSubcategory };
