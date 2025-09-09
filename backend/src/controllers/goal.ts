import { RequestHandler } from "express";
import db from "../db/utils";
import { pg } from "../db/postgre";

// Helpers
const ensureOwnershipByLongTerm = async (long_term_id: string, uid: string) => {
  const { rows } = await db.getById("long_terms", long_term_id, uid);
  if (!rows || rows.length === 0) {
    const err: any = new Error("Not found");
    err.status = 404;
    throw err;
  }
};

const GOAL_CAP_PER_LONG_TERM = 10;

export const listGoals: RequestHandler = async (req, res) => {
  const { long_term_id } = req.query as any;
  const uid = req.user!.id;
  try {
    await ensureOwnershipByLongTerm(String(long_term_id), uid);
    const { rows } = await pg!.query(
      `SELECT g.*, ARRAY_AGG(gl.category_id) FILTER (WHERE gl.category_id IS NOT NULL) AS category_ids
       FROM goals g
       LEFT JOIN goal_category_links gl ON gl.goal_id = g.id
       WHERE g.long_term_id = $1 AND g.user_id = $2
       GROUP BY g.id
       ORDER BY g.updated_at DESC`,
      [long_term_id, uid] as any[]
    );
    res.status(200).json(rows);
  } catch (error: any) {
    const code = error?.status || 500;
    res
      .status(code)
      .json({ error: code === 404 ? "not found" : "internal server error" });
  }
};

export const createGoal: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { long_term_id, statement, category_ids } = req.body as {
    long_term_id: number;
    statement: string;
    category_ids?: number[];
  };
  const trimmed = String(statement || "").trim();
  if (trimmed.length < 1 || trimmed.length > 280)
    return res.status(400).json({ error: "invalid statement" });
  try {
    await ensureOwnershipByLongTerm(String(long_term_id), uid);
    const { rows: countRows } = await pg!.query(
      `SELECT COUNT(*)::int AS cnt FROM goals WHERE long_term_id = $1 AND user_id = $2`,
      [long_term_id, uid] as any[]
    );
    const existingCount = ((countRows?.[0] as any)?.cnt as number) ?? 0;
    if (existingCount >= GOAL_CAP_PER_LONG_TERM) {
      return res.status(400).json({ error: "goal cap reached" });
    }
    // Validate optional categories belong to the same long term
    let validCategoryIds: number[] | undefined = undefined;
    if (Array.isArray(category_ids) && category_ids.length) {
      const unique = Array.from(new Set(category_ids.map((n) => Number(n))));
      const { rows: catRows } = await pg!.query(
        `SELECT DISTINCT category_id FROM cycle_categories WHERE long_term_id = $1 AND category_id = ANY($2::int[])`,
        [long_term_id, unique] as any[]
      );
      validCategoryIds = catRows.map((r: any) => r.category_id);
    }
    const goal = await db.insert("goals", {
      user_id: uid,
      long_term_id,
      statement: trimmed,
    });
    if (validCategoryIds && validCategoryIds.length) {
      const values: any[] = [];
      const placeholders: string[] = [];
      validCategoryIds.forEach((cid, i) => {
        values.push(goal.id, cid);
        placeholders.push(`($${2 * i + 1}, $${2 * i + 2})`);
      });
      await pg!.query(
        `INSERT INTO goal_category_links(goal_id, category_id) VALUES ${placeholders.join(
          ","
        )}
         ON CONFLICT (goal_id, category_id) DO NOTHING`,
        values
      );
    }
    res.status(201).json(goal);
  } catch (error: any) {
    const code = error?.status || 500;
    res
      .status(code)
      .json({ error: code === 404 ? "not found" : "internal server error" });
  }
};

export const updateGoal: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { id } = req.params;
  const { statement } = req.body as { statement?: string };
  const trimmed = String(statement || "").trim();
  if (trimmed.length < 1 || trimmed.length > 280)
    return res.status(400).json({ error: "invalid statement" });
  try {
    // ownership via goal -> long_term -> user join
    const { rows } = await db.getById("goals", id, uid);
    if (!rows || rows.length === 0)
      return res.status(404).json({ error: "not found" });
    const updated = await db.updateById("goals", { statement: trimmed }, id);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export const deleteGoal: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { id } = req.params;
  try {
    const { rows } = await db.getById("goals", id, uid);
    if (!rows || rows.length === 0)
      return res.status(404).json({ error: "not found" });
    await db.deleteById("goals", id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export const linkCategories: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { id } = req.params; // goal id
  const { category_ids } = req.body as { category_ids: number[] };
  if (!Array.isArray(category_ids) || category_ids.length === 0)
    return res.status(400).json({ error: "category_ids required" });
  try {
    const { rows } = await db.getById("goals", id, uid);
    if (!rows || rows.length === 0)
      return res.status(404).json({ error: "not found" });
    const goal = rows[0] as { long_term_id: number };
    // Validate categories belong to the same long term
    const unique = Array.from(new Set(category_ids.map((n) => Number(n))));
    const { rows: catRows } = await pg!.query(
      `SELECT DISTINCT category_id FROM cycle_categories WHERE long_term_id = $1 AND category_id = ANY($2::int[])`,
      [goal.long_term_id, unique] as any[]
    );
    const validCategoryIds = catRows.map((r: any) => r.category_id);
    if (!validCategoryIds.length)
      return res
        .status(400)
        .json({ error: "no valid category_ids for this long term" });
    const values: any[] = [];
    const placeholders: string[] = [];
    validCategoryIds.forEach((cid, i) => {
      values.push(id, cid);
      placeholders.push(`($${2 * i + 1}, $${2 * i + 2})`);
    });
    await pg!.query(
      `INSERT INTO goal_category_links(goal_id, category_id) VALUES ${placeholders.join(
        ","
      )}
       ON CONFLICT (goal_id, category_id) DO NOTHING`,
      values as any[]
    );
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export const unlinkCategories: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { id } = req.params; // goal id
  const { category_ids } = req.body as { category_ids: number[] };
  if (!Array.isArray(category_ids) || category_ids.length === 0)
    return res.status(400).json({ error: "category_ids required" });
  try {
    const { rows } = await db.getById("goals", id, uid);
    if (!rows || rows.length === 0)
      return res.status(404).json({ error: "not found" });
    await pg!.query(
      `DELETE FROM goal_category_links WHERE goal_id = $1 AND category_id = ANY($2::int[])`,
      [id, category_ids] as any[]
    );
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export default {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  linkCategories,
  unlinkCategories,
};
