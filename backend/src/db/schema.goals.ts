import { pg } from "./postgre";

/**
 * Ensure DB schema for Goals feature exists (idempotent).
 */
export async function ensureGoalSchema() {
  if (!pg) throw new Error("pg pool not initialized");

  // Core tables
  await pg.query(`
    CREATE TABLE IF NOT EXISTS goals (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      long_term_id INTEGER NOT NULL REFERENCES long_terms(id) ON DELETE CASCADE,
      statement VARCHAR(280) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS goal_category_links (
      id SERIAL PRIMARY KEY,
      goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (goal_id, category_id)
    );
  `);

  // Indexes to support common queries
  await pg.query(`
    CREATE INDEX IF NOT EXISTS idx_goals_long_term_id_updated_at
      ON goals (long_term_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_goal_category_links_goal_id
      ON goal_category_links (goal_id);
    CREATE INDEX IF NOT EXISTS idx_goal_category_links_category_id
      ON goal_category_links (category_id);
  `);

  // Trigger to auto-update updated_at on UPDATE
  await pg.query(`
    CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at := NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'tr_goals_set_updated_at'
      ) THEN
        CREATE TRIGGER tr_goals_set_updated_at
        BEFORE UPDATE ON goals
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
      END IF;
    END$$;
  `);
}
