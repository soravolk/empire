import { RequestHandler } from "express";
import pg from "../db/postgre";

const createCategory: RequestHandler = async (req, res) => {
  const { user_id, name } = req.body;
  try {
    await pg.query("INSERT INTO categories(user_id, name) VALUES ($1, $2)", [
      user_id,
      name,
    ]);
    res.status(201).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const getCategories: RequestHandler = async (req, res) => {
  try {
    const { rows } = await pg.query("SELECT * FROM categories");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const deleteCategory: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await pg.query("DELETE FROM categories WHERE id = $1", [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default { createCategory, getCategories, deleteCategory };
