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

const getById = async (table: string, id: string) =>
  await pg.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);

const getAll = async (table: string) =>
  await pg.query(`SELECT * FROM ${table}`);

const deleteById = async (table: string, id: string) => {
  await pg.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
};

export default { insert, getAll, getById, deleteById };
