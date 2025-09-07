import { pg } from "../db/postgre";

const mustHasRelations: Record<
  string,
  { parentTable: string; parentKey: string }
> = {
  long_terms: { parentTable: "users", parentKey: "user_id" },
  short_terms: { parentTable: "users", parentKey: "user_id" },
  cycles: { parentTable: "long_terms", parentKey: "long_term_id" },
  cycle_categories: { parentTable: "cycles", parentKey: "cycle_id" },
  cycle_subcategories: { parentTable: "cycles", parentKey: "cycle_id" },
  cycle_contents: { parentTable: "cycles", parentKey: "cycle_id" },
};

const TABLE_WHITELIST = new Set([
  "users", "long_terms", "short_terms", "cycles",
  "cycle_categories", "cycle_subcategories", "cycle_contents"
]);

const COLUMN_WHITELIST: Record<string, Set<string>> = {
  users: new Set(["id","email","..."]),
  long_terms: new Set(["id","user_id","..."]),
  short_terms: new Set(["id","user_id","..."]),
  cycles: new Set(["id","long_term_id","..."]),
  cycle_categories: new Set(["id","cycle_id","..."]),
  cycle_subcategories: new Set(["id","cycle_id","..."]),
  cycle_contents: new Set(["id","cycle_id","..."]),
};

function assertTable(t: string) {
  if (!TABLE_WHITELIST.has(t)) throw new Error(`Invalid table: ${t}`);
  return t;
}
function assertColumn(t: string, c: string) {
  if (!COLUMN_WHITELIST[t]?.has(c)) throw new Error(`Invalid column: ${t}.${c}`);
  return c;
}

const buildOwnershipQueries = (leafTable: string, uid: string) => {
  const joins: string[] = [];
  const params = [];
  const wheres = [];

  let current = leafTable;

  while (mustHasRelations[current]) {
    const rel = mustHasRelations[current];

    joins.push(
      `JOIN ${rel.parentTable}` +
        ` ON ${rel.parentTable}.id = ${current}.${rel.parentKey}`
    );

    current = rel.parentTable;
  }

  if (current === "users") {
    params.push(uid);
    wheres.push(`users.id = $1`);
  }

  return { params, wheres, joins };
};

const insert = async (table: string, data: { [key: string]: any }) => {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map((_, idx) => `$${idx + 1}`);
  const res = await pg.query(
    `INSERT INTO ${table}(${columns.join(",")}) VALUES (${placeholders.join(
      ","
    )}) RETURNING *`,
    values
  );
  return res.rows[0];
};

const getById = async (table: string, id: string, uid: string) => {
  const { params, wheres, joins } = buildOwnershipQueries(table, uid);

  wheres.push(`${table}.id = $${params.length + 1}`);
  params.push(id);

  const sql = `
    SELECT ${table}.*
      FROM ${table}
      ${joins.join("\n")}
     WHERE ${wheres.join(" AND ")}
  `;

  return await pg.query(sql, params);
};

const getWithCondition = async (
  table: string,
  conditions: { [key: string]: any }
) => {
  const keys = Object.keys(conditions);
  const values = Object.values(conditions);
  const placeholders = keys.map((key, idx) => `${key} = $${idx + 1}`);

  return await pg.query(
    `SELECT * FROM ${table} WHERE ${placeholders.join(" AND ")}`,
    values
  );
};

const getAll = async (table: string, uid: string) => {
  const { params, wheres, joins } = buildOwnershipQueries(table, uid);

  const sql = `
    SELECT ${table}.*
      FROM ${table}
      ${joins.join("\n")}
     WHERE ${wheres.join(" AND ")}
  `;

  return await pg.query(sql, params);
};

const getColumnNamesWithoutId = async (table: string) => {
  const res = await pg.query(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = $1
    AND column_name != 'id'
    `,
    [table]
  );
  return res.rows.map((item) => `${table}.${item["column_name"]}`);
};

const getFromInnerJoin = async (
  tableFrom: string,
  tableFromWhere: { [key: string]: any },
  tableTo: string,
  joinOn: [string, string][]
) => {
  const keys = Object.keys(tableFromWhere);
  const whereValues = Object.values(tableFromWhere);
  const whereCondition = keys.map(
    (key, idx) => `${tableFrom}.${key} = $${idx + 1}`
  );

  const joinCondition = joinOn.map(
    (item) => `${tableFrom}.${item[0]} = ${tableTo}.${item[1]}`
  );
  const tableToColumnNames = await getColumnNamesWithoutId(tableTo);

  const query = `
    SELECT ${tableFrom}.*, ${tableToColumnNames.join(",")}
    FROM ${tableFrom}
    INNER JOIN ${tableTo}
    ON (${joinCondition.join(" AND ")})
    WHERE (${whereCondition.join(" AND ")})`;

  return await pg.query(query, whereValues);
};

const deleteById = async (table: string, id: string) => {
  await pg.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
};

const updateById = async (
  table: string,
  data: { [key: string]: any },
  id: string
) => {
  let lastIndexCount = 0;
  const setClause = Object.keys(data)
    .map((key, index) => {
      lastIndexCount = index + 1;
      return `${key} = $${lastIndexCount}`;
    })
    .join(", ");
  const values = [...Object.values(data), id];
  const query = `UPDATE ${table} SET ${setClause} WHERE id = $${
    lastIndexCount + 1
  } RETURNING *`;
  const { rows } = await pg.query(query, values);
  return rows[0];
};

export default {
  insert,
  getAll,
  getById,
  getWithCondition,
  getFromInnerJoin,
  deleteById,
  updateById,
};