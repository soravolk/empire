import { pg } from "../db/postgre";
import type { Pool } from "pg";

const getPool = (): Pool => {
  if (!pg) {
    throw new Error("Database pool not initialized. Call init() first.");
  }
  return pg;
};

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
  goals: { parentTable: "long_terms", parentKey: "long_term_id" },
  goal_category_links: { parentTable: "goals", parentKey: "goal_id" },
};

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
  const res = await getPool().query(
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

  return await getPool().query(sql, params);
};

const getWithCondition = async (
  table: string,
  conditions: { [key: string]: any }
) => {
  const where: string[] = [];
  const params: any[] = [];

  for (const [col, val] of Object.entries(conditions)) {
    if (Array.isArray(val)) {
      if (val.length === 0) {
        // No matches possible when IN list is empty
        return { rows: [] as any[] };
      }
      params.push(val);
      const elemType = typeof val[0] === "number" ? "int" : "text";
      where.push(`${col} = ANY($${params.length}::${elemType}[])`);
    } else if (val === null) {
      where.push(`${col} IS NULL`);
    } else {
      params.push(val);
      where.push(`${col} = $${params.length}`);
    }
  }

  const sql =
    where.length > 0
      ? `SELECT * FROM ${table} WHERE ${where.join(" AND ")}`
      : `SELECT * FROM ${table}`;

  return await getPool().query(sql, params);
};

const getAll = async (table: string, uid: string) => {
  const { params, wheres, joins } = buildOwnershipQueries(table, uid);

  const sql = `
    SELECT ${table}.*
      FROM ${table}
      ${joins.join("\n")}
     WHERE ${wheres.join(" AND ")}
  `;

  return await getPool().query(sql, params);
};

const getColumnNamesWithoutId = async (table: string) => {
  const res = await getPool().query(
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

  return await getPool().query(query, whereValues);
};

const deleteById = async (table: string, id: string) => {
  await getPool().query(`DELETE FROM ${table} WHERE id = $1`, [id]);
};

const deleteWithCondition = async (
  table: string,
  conditions: { [key: string]: any }
) => {
  const where: string[] = [];
  const params: any[] = [];

  for (const [col, val] of Object.entries(conditions)) {
    if (Array.isArray(val)) {
      if (val.length === 0) {
        // nothing to delete
        return 0;
      }
      params.push(val);
      const elemType = typeof val[0] === "number" ? "int" : "text";
      where.push(`${col} = ANY($${params.length}::${elemType}[])`);
    } else if (val === null) {
      where.push(`${col} IS NULL`);
    } else {
      params.push(val);
      where.push(`${col} = $${params.length}`);
    }
  }

  const sql = `DELETE FROM ${table} WHERE ${where.join(" AND ")}`;
  const res = await getPool().query(sql, params);
  return res.rowCount ?? 0;
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
  const { rows } = await getPool().query(query, values);
  return rows[0];
};

export default {
  insert,
  getAll,
  getById,
  getWithCondition,
  getFromInnerJoin,
  deleteWithCondition,
  deleteById,
  updateById,
};
