import { RequestHandler } from "express";
import db from "../db/utils";

const createUser: RequestHandler = async (req, res) => {
  const { id, email, display_name } = req.body;
  try {
    await db.insert("users", { id, email, display_name });
    res.status(201);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const getUsers: RequestHandler = async (req, res) => {
  try {
    const { rows } = await db.getAll("users");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default { createUser, getUsers };
