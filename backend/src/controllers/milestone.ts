import { RequestHandler } from "express";
import {
  PutCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
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

    const milestones = (result.Items || []).map((item) => {
      const milestone: any = {
        id: item.milestone_id,
        name: item.name,
        targetDate: item.target_date,
        level: item.level,
        type: item.type,
        created_at: item.created_at,
      };

      // Add routine-specific fields if present
      if (item.frequency_count !== undefined) {
        milestone.frequencyCount = item.frequency_count;
        milestone.frequencyPeriod = item.frequency_period;
      }
      if (item.duration_amount !== undefined) {
        milestone.durationAmount = item.duration_amount;
        milestone.durationUnit = item.duration_unit;
        milestone.durationPeriod = item.duration_period;
      }
      if (item.linked_target_id) {
        milestone.linkedTargetId = item.linked_target_id;
      }

      return milestone;
    });

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
  const {
    name,
    targetDate,
    level,
    type,
    // Routine-specific fields
    frequencyCount,
    frequencyPeriod,
    durationAmount,
    durationUnit,
    durationPeriod,
    linkedTargetId,
  } = req.body;

  if (!name || !targetDate || level === undefined || !type) {
    return res
      .status(400)
      .json({ message: "Name, targetDate, level, and type are required" });
  }

  try {
    const milestone_id = uuidv4();
    const now = Date.now();

    // Build the item with base fields
    const item: any = {
      milestone_id,
      goal_id: goalId,
      user_id: uid,
      name,
      target_date: targetDate,
      level,
      type,
      created_at: now,
      updated_at: now,
    };

    // Add routine-specific fields if present
    if (type === "routine") {
      if (frequencyCount !== undefined && frequencyPeriod) {
        item.frequency_count = frequencyCount;
        item.frequency_period = frequencyPeriod;
      }
      if (durationAmount !== undefined && durationUnit && durationPeriod) {
        item.duration_amount = durationAmount;
        item.duration_unit = durationUnit;
        item.duration_period = durationPeriod;
      }
      if (linkedTargetId) {
        item.linked_target_id = linkedTargetId;
      }
    }

    const command = new PutCommand({
      TableName: "milestones",
      Item: item,
    });

    await dynamodbClient.send(command);

    res.status(201).json({
      id: milestone_id,
      name,
      targetDate,
      level,
      type,
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

export const updateMilestone: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { milestoneId } = req.params;
  const {
    name,
    targetDate,
    type,
    // Routine-specific fields
    frequencyCount,
    frequencyPeriod,
    durationAmount,
    durationUnit,
    durationPeriod,
    linkedTargetId,
  } = req.body;

  if (!name || !targetDate || !type) {
    return res
      .status(400)
      .json({ message: "Name, targetDate, and type are required" });
  }

  try {
    const now = Date.now();

    // Build update expression dynamically
    const updateParts: string[] = [
      "#name = :name",
      "target_date = :targetDate",
      "#type = :type",
      "updated_at = :updatedAt",
    ];

    const expressionAttributeNames: Record<string, string> = {
      "#name": "name",
      "#type": "type",
    };

    const expressionAttributeValues: Record<string, any> = {
      ":name": name,
      ":targetDate": targetDate,
      ":type": type,
      ":updatedAt": now,
      ":userId": uid,
    };

    const removeParts: string[] = [];

    // Add routine-specific fields if present, or remove them if null/switching to target
    if (type === "routine") {
      // Handle frequency
      if (
        frequencyCount !== undefined &&
        frequencyCount !== null &&
        frequencyPeriod
      ) {
        updateParts.push("frequency_count = :frequencyCount");
        updateParts.push("frequency_period = :frequencyPeriod");
        expressionAttributeValues[":frequencyCount"] = frequencyCount;
        expressionAttributeValues[":frequencyPeriod"] = frequencyPeriod;
      } else if (frequencyCount === null) {
        removeParts.push("frequency_count", "frequency_period");
      }

      // Handle duration
      if (
        durationAmount !== undefined &&
        durationAmount !== null &&
        durationUnit &&
        durationPeriod
      ) {
        updateParts.push("duration_amount = :durationAmount");
        updateParts.push("duration_unit = :durationUnit");
        updateParts.push("duration_period = :durationPeriod");
        expressionAttributeValues[":durationAmount"] = durationAmount;
        expressionAttributeValues[":durationUnit"] = durationUnit;
        expressionAttributeValues[":durationPeriod"] = durationPeriod;
      } else if (durationAmount === null) {
        removeParts.push("duration_amount", "duration_unit", "duration_period");
      }

      // Handle linked target (explicitly check for null to remove)
      if (
        linkedTargetId !== undefined &&
        linkedTargetId !== null &&
        linkedTargetId !== ""
      ) {
        updateParts.push("linked_target_id = :linkedTargetId");
        expressionAttributeValues[":linkedTargetId"] = linkedTargetId;
      } else if (linkedTargetId === null || linkedTargetId === "") {
        removeParts.push("linked_target_id");
      }
    } else {
      // If switching to target type, remove all routine fields
      removeParts.push(
        "frequency_count",
        "frequency_period",
        "duration_amount",
        "duration_unit",
        "duration_period",
        "linked_target_id",
      );
    }

    // Build the full update expression
    let updateExpression = `SET ${updateParts.join(", ")}`;
    if (removeParts.length > 0) {
      updateExpression += ` REMOVE ${removeParts.join(", ")}`;
    }

    const command = new UpdateCommand({
      TableName: "milestones",
      Key: {
        milestone_id: milestoneId,
      },
      UpdateExpression: updateExpression,
      ConditionExpression: "user_id = :userId",
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const result = await dynamodbClient.send(command);
    const item = result.Attributes;

    res.status(200).json({
      id: item?.milestone_id,
      name: item?.name,
      targetDate: item?.target_date,
      level: item?.level,
      type: item?.type,
    });
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this milestone" });
    }
    console.error("Error updating milestone:", error);
    res.status(500).json({ message: "Failed to update milestone" });
  }
};
