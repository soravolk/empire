import { RequestHandler } from "express";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodbClient } from "../db/dynamodb";
import { v4 as uuidv4 } from "uuid";
import db from "../db/utils";

const getDetails: RequestHandler = async (req, res) => {
  const { id: uid } = req.user!;
  try {
    const { rows } = await db.getAll("tasks", uid);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const createTask: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { milestone_id, name, description, due_date } = req.body;

  if (!milestone_id || !name) {
    return res.status(400).json({ error: "milestone_id and name are required" });
  }

  try {
    const task_id = uuidv4();

    const command = new PutCommand({
      TableName: "tasks",
      Item: {
        task_id,
        user_id: uid,
        milestone_id,
        name,
        description: description || "",
        due_date: due_date || null,
        time_spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    await dynamodbClient.send(command);

    res.status(201).json({
      task_id,
      milestone_id,
      name,
      description: description || "",
      due_date: due_date || null,
      time_spent: 0,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "internal server error" });
  }
};

export default { getDetails, createTask };

