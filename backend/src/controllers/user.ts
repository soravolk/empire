import { dynamodbClient } from "../db/dynamodb";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const createUser = async (id: string, email: string, display_name: string) => {
  try {
    const created_at = Date.now();
    const updated_at = created_at;

    const command = new PutCommand({
      TableName: "users",
      Item: {
        user_id: id,
        email,
        display_name,
        created_at,
        updated_at,
      },
    });

    await dynamodbClient.send(command);

    return { user_id: id, email, display_name, created_at, updated_at };
  } catch (error) {
    console.error("Failed to create user:", error);
    throw new Error("Failed to create a new user");
  }
};

const getUserById = async (user_id: string) => {
  try {
    const command = new GetCommand({
      TableName: "users",
      Key: {
        user_id,
      },
    });

    const response = await dynamodbClient.send(command);
    return response.Item;
  } catch (error) {
    console.error("Failed to get user:", error);
    throw new Error("Failed to get user from the specified ID");
  }
};

export default { createUser, getUserById };
