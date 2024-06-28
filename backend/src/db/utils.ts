import pg from "../db/postgre";

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

const getById = async (table: string, id: string) =>
  await pg.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);

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

const getAll = async (table: string) =>
  await pg.query(`SELECT * FROM ${table}`);

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

export default {
  insert,
  getAll,
  getById,
  getWithCondition,
  getFromInnerJoin,
  deleteById,
};
