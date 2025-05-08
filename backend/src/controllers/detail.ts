import { RequestHandler } from "express";
import db from "../db/utils";

const getDetails: RequestHandler = async (req, res) => {
  try {
    const { rows } = await db.getAll("details");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default { getDetails };
