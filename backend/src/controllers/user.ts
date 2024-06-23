import db from "../db/utils";

// TODO: id should use number type
const createUser = async (id: string, email: string, display_name: string) => {
  try {
    await db.insert("users", { id, email, display_name });
  } catch (error) {
    throw new Error("failed to create a new user");
  }
};

const getUserById = async (id: string) => {
  try {
    const { rows } = await db.getById("users", id);
    return rows[0];
  } catch (error) {
    throw new Error("failed to get an user from the specified ID");
  }
};

export default { createUser, getUserById };
