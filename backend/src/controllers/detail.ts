import { RequestHandler } from "express";
import db from "../db/utils";

const createDetail: RequestHandler = async (req, res) => {
  const { contentId: content_id, shortTermId: short_term_id, name } = req.body;
  try {
    res.status(201).send(
      await db.insert("details", {
        content_id,
        short_term_id,
        name,
        time_spent: 0,
      })
    );
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default { createDetail };
