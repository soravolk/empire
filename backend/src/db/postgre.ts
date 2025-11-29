import { Pool } from "pg";

export let pg: Pool | undefined = undefined;

export const init = async () => {
  const { NODE_ENV, PG_USER, PG_HOST, PG_DATABASE, PG_PASSWORD, PG_PORT } =
    process.env;
  if (
    !PG_HOST ||
    !PG_USER ||
    (NODE_ENV === "production" && !PG_PASSWORD) ||
    !PG_DATABASE
  ) {
    throw new Error(
      "Missing required DB env vars (PG_HOST, PG_USER, PG_PASSWORD, PG_DATABASE)"
    );
  }

  pg = new Pool({
    user: PG_USER,
    host: PG_HOST,
    database: PG_DATABASE,
    port: Number(PG_PORT),
    password: PG_PASSWORD,
    ssl: NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });
  return pg;
};
