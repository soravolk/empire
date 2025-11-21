import { Pool } from "pg";
import { getDatabaseSecret } from "./getSecret";

export let pg: Pool | undefined = undefined;

export const init = async () => {
  const { NODE_ENV, PG_USER, PG_HOST, PG_DATABASE } = process.env;

  if (NODE_ENV === "production") {
    // Use Secrets Manager in production for full DB configuration
    const cfg = await getDatabaseSecret();
    console.log(
      `[DB] Using host: ${cfg.host}, port: ${cfg.port}, db: ${cfg.database}`
    );
    pg = new Pool({
      user: cfg.user,
      host: cfg.host,
      database: cfg.database,
      port: cfg.port,
      password: cfg.password,
      ssl: { rejectUnauthorized: false }, // TODO: enable proper SSL validation with CA
    });
    return;
  }

  // Local/dev: use environment variables
  pg = new Pool({
    user: PG_USER,
    host: PG_HOST,
    database: PG_DATABASE,
    port: 5432,
    password: process.env.PG_PASSWORD,
  });
};
