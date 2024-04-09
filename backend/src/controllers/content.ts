import { RequestHandler } from "express";
import db from "../db/utils";

const createContent: RequestHandler = async (req, res) => {
  const { subcategory_id, name } = req.body;
  try {
    await db.insert("contents", { subcategory_id, name });
    res.status(201).send();
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getContents: RequestHandler = async (req, res) => {
  try {
    const { rows } = await db.getAll("contents");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const deleteContent: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteById("contents", id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default { createContent, getContents, deleteContent };
