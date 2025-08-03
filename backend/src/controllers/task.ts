import { RequestHandler } from "express";
import db from "../db/utils";

const getDetails: RequestHandler = async (req, res) => {
  const { id: uid } = req.user!;
  try {
    const { rows } = await db.getAll("tasks", uid);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default { getDetails };
