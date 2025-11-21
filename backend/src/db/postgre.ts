import { Pool } from "pg";
import { getDatabaseSecret } from "./getSecret";

export let pg: Pool | undefined = undefined;

export const init = async () => {
  // Local/dev: use environment variables
  const { NODE_ENV, PG_USER, PG_HOST, PG_DATABASE } = process.env;
  let user = PG_USER,
    host = PG_HOST,
    database = PG_DATABASE,
    port = 5432,
    password,
    ssl;

  // Use Secrets Manager in production
  if (NODE_ENV === "production") {
    ({ user, host, database, port, password, ssl } = await getDatabaseSecret());
    ssl = { rejectUnauthorized: false }; // TODO: enable proper SSL validation with CA
  }

  pg = new Pool({
    user,
    host,
    database,
    port,
    password,
    ssl,
  });
};
