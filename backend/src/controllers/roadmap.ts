import { RequestHandler } from "express";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { dynamodbClient } from "../db/dynamodb";

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
