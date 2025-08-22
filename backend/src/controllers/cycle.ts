import { RequestHandler } from "express";
import db from "../db/utils";

const createCycle: RequestHandler = async (req, res) => {
  const {
    longTermId: long_term_id,
    startTime: start_time,
    endTime: end_time,
  } = req.body;
  try {
    res
      .status(201)
      .send(await db.insert("cycles", { long_term_id, start_time, end_time }));
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
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

const getContentsFromCycle: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.getFromInnerJoin(
      "cycle_contents",
      {
        cycle_id: id,
      },
      "contents",
      [["content_id", "id"]]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getContentFromCycleById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.getFromInnerJoin(
      "cycle_contents",
      {
        id,
      },
      "contents",
      [["content_id", "id"]]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getCycles: RequestHandler = async (req, res) => {
  const { id: uid } = req.user!;
  const { longTermId } = req.query;
  try {
    const { rows } = longTermId
      ? await db.getWithCondition("cycles", {
          long_term_id: longTermId,
        })
      : await db.getAll("cycles", uid);
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


const deleteCategoryFromCycle: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteById("cycle_categories", id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const addSubcategoryToCycle: RequestHandler = async (req, res) => {
  const { id: cycle_id } = req.params;
  const { subcategoryId: subcategory_id } = req.body;
  try {
    await db.insert("cycle_subcategories", { cycle_id, subcategory_id });
    res.status(201).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const deleteSubcategoryFromCycle: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteById("cycle_subcategories", id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const addContentToCycle: RequestHandler = async (req, res) => {
  const { id: cycle_id } = req.params;
  const { contentId: content_id } = req.body;
  try {
    await db.insert("cycle_contents", { cycle_id, content_id });
    res.status(201).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const deleteContentFromCycle: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteById("cycle_contents", id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default {
  createCycle,
  getSubcategoriesFromCycle,
  getContentsFromCycle,
  getContentFromCycleById,
  getCycles,
  deleteCycle,
  addSubcategoryToCycle,
  addContentToCycle,
  deleteCategoryFromCycle,
  deleteSubcategoryFromCycle,
  deleteContentFromCycle,
};
