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
  const { id: uid } = req.user!;
  try {
    const { rows } = await db.getAll("long_terms", uid);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const deleteLongTerm: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteById("long_terms", id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const getCategoriesFromLongTerm: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.getFromInnerJoin(
      "cycle_categories",
      { long_term_id: id },
      "categories",
      [["category_id", "id"]]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const getSubcategoriesFromLongTerm: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.getFromInnerJoin(
      "cycle_subcategories",
      { long_term_id: id },
      "subcategories",
      [["subcategory_id", "id"]]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const addCategoryToLongTerm: RequestHandler = async (req, res) => {
  const { id: long_term_id } = req.params;
  const { categoryId: category_id } = req.body;
  try {
    await db.insert("cycle_categories", { long_term_id, category_id });
    res.status(201).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const addSubcategoryToLongTerm: RequestHandler = async (req, res) => {
  const { id: long_term_id } = req.params;
  const { subcategoryId: subcategory_id } = req.body;
  try {
    await db.insert("cycle_subcategories", { long_term_id, subcategory_id });
    res.status(201).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const deleteCategoryFromLongTerm: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteById("cycle_categories", id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default {
  createLongTerm,
  getLongTerms,
  deleteLongTerm,
  getCategoriesFromLongTerm,
  getSubcategoriesFromLongTerm,
  addCategoryToLongTerm,
  addSubcategoryToLongTerm,
  deleteCategoryFromLongTerm,
};
