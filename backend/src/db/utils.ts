import pg from "../db/postgre";

const insert = async (table: string, data: { [key: string]: any }) => {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map((_, idx) => `$${idx + 1}`);

  await pg.query(
    `INSERT INTO ${table}(${columns.join(",")}) VALUES (${placeholders.join(
      ","
    )})`,
    values
  );
};

const getAll = async (table: string) =>
  await pg.query(`SELECT * FROM ${table}`);

const remove = async (table: string, conditions: { [key: string]: any }) => {
  const columns = Object.keys(conditions);
  const values = Object.values(conditions);
  await pg.query(
    `DELETE FROM ${table} WHERE ${columns
      .map((col, idx) => `${col}=$${idx + 1}`)
      .join(" AND ")}`,
    values
  );
};

export default { insert, getAll, remove };
