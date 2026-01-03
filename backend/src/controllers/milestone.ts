import { RequestHandler } from "express";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodbClient } from "../db/dynamodb";
import { v4 as uuidv4 } from "uuid";

export const createMilestone: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { goalId } = req.params;
  const { name, targetDate, level } = req.body;

  if (!name || !targetDate || level === undefined) {
    return res
      .status(400)
      .json({ message: "Name, targetDate, and level are required" });
  }

  try {
    const milestone_id = uuidv4();
    const now = Date.now();

    const command = new PutCommand({
      TableName: "milestones",
      Item: {
        milestone_id,
        goal_id: goalId,
        user_id: uid,
        name,
        target_date: targetDate,
        level,
        created_at: now,
        updated_at: now,
      },
    });

    await dynamodbClient.send(command);

    res.status(201).json({
      id: milestone_id,
      name,
      targetDate,
      level,
    });
  } catch (error) {
    console.error("Error creating milestone:", error);
    res.status(500).json({ message: "Failed to create milestone" });
  }
};
