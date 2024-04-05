import { RequestHandler } from "express";
import pg from "../db/postgre";

const createUser: RequestHandler = async (req, res) => {
  const { id, email, display_name } = req.body;
  try {
    await pg.query(
      "INSERT INTO users(id, email, display_name) VALUES ($1, $2, $3)",
      [id, email, display_name]
    );
    res.status(201);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const getUsers: RequestHandler = async (req, res) => {
  try {
    const { rows } = await pg.query("SELECT * FROM users");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default { createUser, getUsers };
