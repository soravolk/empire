import { RequestHandler } from "express";
import db from "../db/utils";
import { pg } from "../db/postgre";

// Auth guard: ensure long_term_id belongs to the authenticated user; throws 404 if not.
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
  const { longTermId: long_term_id } = req.query as any;
  const uid = req.user!.id;
  try {
    await ensureOwnershipByLongTerm(String(long_term_id), uid);
    // 1) Fetch goals for this long term and user
    const { rows: goals } = await db.getWithCondition("goals", {
      long_term_id,
      user_id: uid,
    });
    if (!goals || goals.length === 0) return res.status(200).json([]);

    // 2) Fetch all category links for these goal ids (single query)
    const goalIds = goals.map((g: any) => g.id);
    const { rows: links } = await db.getWithCondition("goal_category_links", {
      goal_id: goalIds,
    });

    // 3) Aggregate links by goal id in Node
    const byGoal: Record<number, number[]> = {};
    for (const link of links as Array<{
      goal_id: number;
      category_id: number;
    }>) {
      if (!byGoal[link.goal_id]) byGoal[link.goal_id] = [];
      byGoal[link.goal_id].push(link.category_id);
    }

    // 4) Sort by updated_at desc (match previous ordering)
    const sorted = [...goals].sort((a: any, b: any) => {
      const ad = new Date(a.updated_at as any).getTime();
      const bd = new Date(b.updated_at as any).getTime();
      return bd - ad;
    });

    // 5) Return goals with aggregated category_ids
    const result = sorted.map((goal: any) => ({
      ...goal,
      category_ids: byGoal[goal.id] ?? [],
    }));
    res.status(200).json(result);
  } catch (error: any) {
    const code = error?.status || 500;
    res
      .status(code)
      .json({ error: code === 404 ? "not found" : "internal server error" });
  }
};

export const createGoal: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const {
    longTermId: long_term_id,
    statement,
    categoryIds: category_ids,
  } = req.body as {
    longTermId: number;
    statement: string;
    categoryIds?: number[];
  };
  const trimmed = String(statement || "").trim();
  if (trimmed.length < 1 || trimmed.length > 280)
    return res.status(400).json({ error: "invalid statement" });
  try {
    await ensureOwnershipByLongTerm(String(long_term_id), uid);
    // Use db.getWithCondition for counting existing goals
    const { rows: countRows } = await db.getWithCondition("goals", {
      long_term_id,
      user_id: uid,
    });
    const existingCount = countRows.length;
    if (existingCount >= GOAL_CAP_PER_LONG_TERM) {
      return res.status(400).json({ error: "goal cap reached" });
    }
    const goal = await db.insert("goals", {
      user_id: uid,
      long_term_id,
      statement: trimmed,
    });
    if (Array.isArray(category_ids) && category_ids.length) {
      // 1) reject payload duplicates (unexpected for now)
      const uniqueIds = Array.from(new Set(category_ids));
      if (uniqueIds.length !== category_ids.length) {
        return res
          .status(400)
          .json({ error: "duplicate category_ids in payload" });
      }
      // 2) pre-check existing links to avoid partial inserts
      const { rows: existing } = await db.getWithCondition(
        "goal_category_links",
        { goal_id: goal.id, category_id: uniqueIds }
      );
      if (existing.length > 0) {
        const dupIds = (existing as any[]).map((r) => r.category_id);
        return res.status(409).json({
          error: "category link already exists",
          category_ids: dupIds,
        });
      }
      // 3) perform plain inserts; treat unique violation as unexpected for now
      for (const cid of uniqueIds) {
        try {
          await db.insert("goal_category_links", {
            goal_id: goal.id,
            category_id: cid,
          });
        } catch (e: any) {
          if (e?.code === "23505") {
            return res.status(409).json({
              error: "category link already exists",
              category_ids: [cid],
            });
          }
          throw e;
        }
      }
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
  const { categoryIds: category_ids } = req.body as { categoryIds: number[] };
  if (!Array.isArray(category_ids) || category_ids.length === 0)
    return res.status(400).json({ error: "categoryIds required" });
  try {
    const { rows } = await db.getById("goals", id, uid);
    if (!rows || rows.length === 0)
      return res.status(404).json({ error: "not found" });
    const uniqueIds = Array.from(new Set(category_ids));
    if (uniqueIds.length !== category_ids.length) {
      return res
        .status(400)
        .json({ error: "duplicate category_ids in payload" });
    }
    const { rows: existing } = await db.getWithCondition(
      "goal_category_links",
      { goal_id: Number(id), category_id: uniqueIds }
    );
    if (existing.length > 0) {
      const dupIds = (existing as any[]).map((r) => r.category_id);
      return res
        .status(409)
        .json({ error: "category link already exists", category_ids: dupIds });
    }
    for (const cid of uniqueIds) {
      try {
        await db.insert("goal_category_links", {
          goal_id: Number(id),
          category_id: cid,
        });
      } catch (e: any) {
        if (e?.code === "23505") {
          return res.status(409).json({
            error: "category link already exists",
            category_ids: [cid],
          });
        }
        throw e;
      }
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

export const unlinkCategories: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { id } = req.params; // goal id
  const { categoryIds: category_ids } = req.body as { categoryIds: number[] };
  if (!Array.isArray(category_ids) || category_ids.length === 0)
    return res.status(400).json({ error: "category_ids required" });
  try {
    const { rows } = await db.getById("goals", id, uid);
    if (!rows || rows.length === 0)
      return res.status(404).json({ error: "not found" });
    await db.deleteWithCondition("goal_category_links", {
      goal_id: Number(id),
      category_id: category_ids,
    });
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
