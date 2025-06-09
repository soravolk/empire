import { Pool } from "pg";
import { getDatabaseSecret } from "./getSecret";

export let pg: Pool | undefined = undefined;

export const init = async () => {
  const { PG_USER, PG_HOST, PG_DATABASE, PORT, NODE_ENV } = process.env;

  let databasePassword = undefined;

  if (NODE_ENV === "production") {
    databasePassword = await getDatabaseSecret();
    if (databasePassword == undefined) {
      throw new Error("RDS secret is undefined");
    }

    if (typeof databasePassword !== "string") {
      throw new Error("RDS secret is not string");
    }
  }

  pg = new Pool({
    user: PG_USER,
    host: PG_HOST,
    database: PG_DATABASE,
    port: 5432,
    password: databasePassword,
    ssl: {
      rejectUnauthorized: false, // TODO: add SSL and set to true ASAP
    },
  });
};
