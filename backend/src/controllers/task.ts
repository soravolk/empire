import { RequestHandler } from "express";
import { PutCommand, ScanCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodbClient } from "../db/dynamodb";
import { v4 as uuidv4 } from "uuid";
import db from "../db/utils";

const getTasksByMilestone: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { milestone_id } = req.params;

  if (!milestone_id) {
    return res.status(400).json({ error: "milestone_id is required" });
  }

  try {
    const command = new ScanCommand({
      TableName: "tasks",
      FilterExpression: "milestone_id = :milestone_id AND user_id = :user_id",
      ExpressionAttributeValues: {
        ":milestone_id": milestone_id,
        ":user_id": uid,
      },
    });

    const result = await dynamodbClient.send(command);
    res.status(200).json(result.Items || []);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "internal server error" });
  }
};

const createTask: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { milestone_id, name, description, due_date } = req.body;

  if (!milestone_id || !name) {
    return res
      .status(400)
      .json({ error: "milestone_id and name are required" });
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

const updateTask: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { task_id } = req.params;
  const { name, description, due_date, time_spent } = req.body;

  if (!task_id) {
    return res.status(400).json({ error: "task_id is required" });
  }

  try {
    // First verify the task belongs to the user
    const getCommand = new GetCommand({
      TableName: "tasks",
      Key: { task_id },
    });

    const getResult = await dynamodbClient.send(getCommand);
    
    if (!getResult.Item) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (getResult.Item.user_id !== uid) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Build update expression dynamically based on provided fields
    const updateExpressions: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    if (name !== undefined) {
      updateExpressions.push("#name = :name");
      expressionAttributeNames["#name"] = "name";
      expressionAttributeValues[":name"] = name;
    }

    if (description !== undefined) {
      updateExpressions.push("#description = :description");
      expressionAttributeNames["#description"] = "description";
      expressionAttributeValues[":description"] = description;
    }

    if (due_date !== undefined) {
      updateExpressions.push("#due_date = :due_date");
      expressionAttributeNames["#due_date"] = "due_date";
      expressionAttributeValues[":due_date"] = due_date;
    }

    if (time_spent !== undefined) {
      updateExpressions.push("#time_spent = :time_spent");
      expressionAttributeNames["#time_spent"] = "time_spent";
      expressionAttributeValues[":time_spent"] = time_spent;
    }

    // Always update the updated_at timestamp
    updateExpressions.push("#updated_at = :updated_at");
    expressionAttributeNames["#updated_at"] = "updated_at";
    expressionAttributeValues[":updated_at"] = new Date().toISOString();

    if (updateExpressions.length === 1) {
      // Only updated_at would be updated, no actual changes
      return res.status(400).json({ error: "No fields to update" });
    }

    const updateCommand = new UpdateCommand({
      TableName: "tasks",
      Key: { task_id },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const result = await dynamodbClient.send(updateCommand);

    res.status(200).json(result.Attributes);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "internal server error" });
  }
};

export default { getTasksByMilestone, createTask, updateTask };
