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

const getFromInnerJoin = async (
  tableFrom: string,
  tableFromConditions: { [key: string]: any },
  tableTo: string,
  joinOn: [string, string][]
) => {
  const keys = Object.keys(tableFromConditions);
  const whereValues = Object.values(tableFromConditions);
  const placeholders = keys.map(
    (key, idx) => `${tableFrom}.${key} = $${idx + 1}`
  );
  joinOn.forEach((item) =>
    placeholders.push(`${tableFrom}.${item[0]} = ${tableTo}.${item[1]}`)
  );
  const query = `SELECT * FROM ${tableFrom} INNER JOIN ${tableTo} ON (${placeholders.join(
    " AND "
  )})`;
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
