import { RequestHandler } from "express";
import db from "../db/utils";

const createCycle: RequestHandler = async (req, res) => {
  const { long_term_id, start_time, end_time } = req.body;
  try {
    await db.insert("cycles", { long_term_id, start_time, end_time });
    res.status(201).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const getCycle: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.getById("cycles", id);
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const getCategoriesFromCycle: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.getFromInnerJoin(
      "cycle_categories",
      {
        cycle_id: id,
      },
      "categories",
      [["category_id", "id"]]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getSubcategoriesFromCycle: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.getFromInnerJoin(
      "cycle_subcategories",
      {
        cycle_id: id,
      },
      "subcategories",
      [["subcategory_id", "id"]]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getCycles: RequestHandler = async (req, res) => {
  const { longTermId } = req.query;
  try {
    const { rows } = longTermId
      ? await db.getWithCondition("cycles", {
          long_term_id: longTermId,
        })
      : await db.getAll("cycles");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const deleteCycle: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteById("cycles", id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const addCategoryToCycle: RequestHandler = async (req, res) => {
  const { id: cycle_id } = req.params;
  const { category_id } = req.body;
  try {
    await db.insert("cycle_categories", { cycle_id, category_id });
    res.status(201).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const addSubcategoryToCycle: RequestHandler = async (req, res) => {
  const { id: cycle_id } = req.params;
  const { subcategory_id } = req.body;
  try {
    await db.insert("cycle_subcategories", { cycle_id, subcategory_id });
    res.status(201).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const addContentToCycle: RequestHandler = async (req, res) => {
  const { id: cycle_id } = req.params;
  const { content_id } = req.body;
  try {
    await db.insert("cycle_contents", { cycle_id, content_id });
    res.status(201).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default {
  createCycle,
  getCycle,
  getCategoriesFromCycle,
  getSubcategoriesFromCycle,
  getCycles,
  deleteCycle,
  addCategoryToCycle,
  addSubcategoryToCycle,
  addContentToCycle,
};
