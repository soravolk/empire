import { RequestHandler } from "express";
import { PutCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodbClient } from "../db/dynamodb";
import { v4 as uuidv4 } from "uuid";

export const listMilestones: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { goalId } = req.params;

  try {
    const command = new ScanCommand({
      TableName: "milestones",
      FilterExpression: "goal_id = :goalId AND user_id = :userId",
      ExpressionAttributeValues: {
        ":goalId": goalId,
        ":userId": uid,
      },
    });

    const result = await dynamodbClient.send(command);

    const milestones = (result.Items || []).map((item) => ({
      id: item.milestone_id,
      name: item.name,
      targetDate: item.target_date,
      level: item.level,
      created_at: item.created_at,
    }));

    // Sort by level
    milestones.sort((a, b) => a.level - b.level);

    res.status(200).json(milestones);
  } catch (error) {
    console.error("Error listing milestones:", error);
    res.status(500).json({ message: "Failed to list milestones" });
  }
};

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

export const deleteMilestone: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { milestoneId } = req.params;

  try {
    const command = new DeleteCommand({
      TableName: "milestones",
      Key: {
        milestone_id: milestoneId,
      },
      ConditionExpression: "user_id = :userId",
      ExpressionAttributeValues: {
        ":userId": uid,
      },
    });

    await dynamodbClient.send(command);

    res.status(200).json({ message: "Milestone deleted successfully" });
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this milestone" });
    }
    console.error("Error deleting milestone:", error);
    res.status(500).json({ message: "Failed to delete milestone" });
  }
};
