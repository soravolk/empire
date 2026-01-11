import { RequestHandler } from "express";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodbClient } from "../db/dynamodb";
import { v4 as uuidv4 } from "uuid";

// Simple unmarshall helper for DynamoDB items
const unmarshallItem = (item: any): any => {
  const result: any = {};
  for (const key in item) {
    const value = item[key];
    if (value.S) {
      result[key] = value.S;
    } else if (value.N) {
      result[key] = parseInt(value.N, 10);
    } else if (value.M) {
      result[key] = unmarshallItem(value.M);
    } else if (value.L) {
      result[key] = value.L.map(unmarshallItem);
    } else if (value.BOOL) {
      result[key] = value.BOOL;
    } else if (value.NULL) {
      result[key] = null;
    }
  }
  return result;
};

export const listRoadmapGoals: RequestHandler = async (req, res) => {
  const uid = req.user!.id;

  try {
    const command = new ScanCommand({
      TableName: "goals",
      FilterExpression: "user_id = :uid",
      ExpressionAttributeValues: {
        ":uid": { S: uid },
      },
    });

    const response = await dynamodbClient.send(command);

    const goals = (response.Items || []).map((item) => {
      const unmarshalled = unmarshallItem(item);
      return {
        goal_id: unmarshalled.goal_id,
        title: unmarshalled.title,
        targetDate: unmarshalled.targetDate,
      };
    });

    res.status(200).json(goals);
  } catch (error) {
    console.error("Error fetching roadmap goals:", error);
    res.status(500).json({ message: "Failed to fetch goals" });
  }
};

export const createRoadmapGoal: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { title, targetDate } = req.body;

  if (!title || !targetDate) {
    return res
      .status(400)
      .json({ message: "Title and targetDate are required" });
  }

  try {
    const goal_id = uuidv4();
    const now = Date.now();

    const command = new PutCommand({
      TableName: "goals",
      Item: {
        goal_id,
        user_id: uid,
        title,
        targetDate,
        created_at: now,
        updated_at: now,
      },
    });

    await dynamodbClient.send(command);

    res.status(201).json({
      goal_id,
      title,
      targetDate,
    });
  } catch (error) {
    console.error("Error creating roadmap goal:", error);
    res.status(500).json({ message: "Failed to create goal" });
  }
};

export const updateRoadmapGoal: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { goal_id } = req.params;
  const { title, targetDate } = req.body;

  if (!title || !targetDate) {
    return res
      .status(400)
      .json({ message: "Title and targetDate are required" });
  }

  try {
    const now = Date.now();

    const command = new PutCommand({
      TableName: "goals",
      Item: {
        goal_id,
        user_id: uid,
        title,
        targetDate,
        updated_at: now,
      },
    });

    await dynamodbClient.send(command);

    res.status(200).json({
      goal_id,
      title,
      targetDate,
    });
  } catch (error) {
    console.error("Error updating roadmap goal:", error);
    res.status(500).json({ message: "Failed to update goal" });
  }
};
