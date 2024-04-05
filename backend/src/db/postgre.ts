import { Pool } from "pg";

const pg = new Pool({
  user: "soravolk",
  host: "localhost",
  database: "empire",
  port: 5432,
});

export default pg;
