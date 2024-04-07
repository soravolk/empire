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

const getCycles: RequestHandler = async (req, res) => {
  try {
    const { rows } = await db.getAll("cycles");
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

export default { createCycle, getCycle, getCycles, deleteCycle };
