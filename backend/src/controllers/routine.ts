import { RequestHandler } from "express";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodbClient } from "../db/dynamodb";
import { v4 as uuidv4 } from "uuid";

/**
 * Add a routine completion
 * POST /roadmap/goals/:goalId/milestones/:milestoneId/routine/complete
 */
export const addRoutineCompletion: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { milestoneId } = req.params;
  const { timestamp } = req.body;

  if (!milestoneId) {
    return res.status(400).json({ message: "milestoneId param is required" });
  }

  // Accept missing timestamp (use server time) or numeric/string timestamp
  let recordedAt: number;
  if (timestamp === undefined || timestamp === null) {
    recordedAt = Date.now();
  } else {
    recordedAt = Number(timestamp);
    if (!Number.isFinite(recordedAt)) {
      // fallback to now if parsing fails
      recordedAt = Date.now();
    }
  }

  try {
    const completion_id = uuidv4();
    const now = Date.now();

    const item = {
      completion_id,
      milestone_id: milestoneId,
      user_id: uid,
      recorded_at: recordedAt, // numeric epoch ms
      created_at: now,
    };

    const command = new PutCommand({
      TableName: "routine_completions",
      Item: item,
    });

    await dynamodbClient.send(command);

    res.status(201).json({
      id: completion_id,
      milestoneId,
      completedAt: recordedAt,
      createdAt: now,
    });
  } catch (error) {
    console.error("Error adding routine completion:", error);
    res.status(500).json({ message: "Failed to add routine completion" });
  }
};

/**
 * Add routine time entry
 * POST /roadmap/goals/:goalId/milestones/:milestoneId/routine/time
 */
export const addRoutineTime: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { milestoneId } = req.params;
  const { minutes, timestamp } = req.body;

  if (!milestoneId) {
    return res.status(400).json({ message: "milestoneId param is required" });
  }

  if (minutes === undefined || minutes === null) {
    return res.status(400).json({ message: "Minutes is required" });
  }

  // Accept missing timestamp (use server time) or numeric/string timestamp
  let recordedAtTime: number;
  if (timestamp === undefined || timestamp === null) {
    recordedAtTime = Date.now();
  } else {
    recordedAtTime = Number(timestamp);
    if (!Number.isFinite(recordedAtTime)) {
      // fallback to now if parsing fails
      recordedAtTime = Date.now();
    }
  }

  try {
    const time_entry_id = uuidv4();
    const now = Date.now();

    const item = {
      time_entry_id,
      milestone_id: milestoneId,
      user_id: uid,
      duration_minutes: Number(minutes),
      recorded_at: recordedAtTime, // numeric epoch ms
      created_at: now,
    };

    const command = new PutCommand({
      TableName: "routine_time_entries",
      Item: item,
    });

    await dynamodbClient.send(command);

    res.status(201).json({
      id: time_entry_id,
      milestoneId,
      durationMinutes: Number(minutes),
      recordedAt: recordedAtTime,
      createdAt: now,
    });
  } catch (error) {
    console.error("Error adding routine time entry:", error);
    res.status(500).json({ message: "Failed to add routine time entry" });
  }
};

/**
 * Get routine completion history
 * GET /roadmap/goals/:goalId/milestones/:milestoneId/routine/history?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export const getRoutineHistory: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { milestoneId } = req.params;
  const { from, to } = req.query;

  try {
    // Query completions for the milestone (range can be applied later)
    const completionsCommand = new QueryCommand({
      TableName: "routine_completions",
      KeyConditionExpression: "milestone_id = :milestoneId",
      ExpressionAttributeValues: {
        ":milestoneId": milestoneId,
      },
      // Optionally you can add Limit, ScanIndexForward, or range conditions
    });

    const completionsResult = await dynamodbClient.send(completionsCommand);
    let completions = (completionsResult.Items || []).map((item) => ({
      id: item.completion_id,
      recordedAt: item.recorded_at,
      createdAt: item.created_at,
    }));

    // Get time entries
    const timeEntriesCommand = new QueryCommand({
      TableName: "routine_time_entries",
      KeyConditionExpression: "milestone_id = :milestoneId",
      ExpressionAttributeValues: {
        ":milestoneId": milestoneId,
      },
    });

    const timeEntriesResult = await dynamodbClient.send(timeEntriesCommand);
    let timeEntries = (timeEntriesResult.Items || []).map((item) => ({
      id: item.time_entry_id,
      durationMinutes: item.duration_minutes,
      recordedAt: item.recorded_at,
      createdAt: item.created_at,
    }));

    // Filter by date range if provided
    if (from || to) {
      const fromDate = from ? new Date(from as string).getTime() : 0;
      const toDate = to
        ? new Date(to as string).getTime()
        : Date.now() + 86400000; // +1 day

      // Filter in-memory results (could be pushed into Query KeyConditionExpression)
      completions = completions.filter(
        (c) => c.recordedAt >= fromDate && c.recordedAt <= toDate,
      );
      timeEntries = timeEntries.filter(
        (t) => t.recordedAt >= fromDate && t.recordedAt <= toDate,
      );
    }

    res.status(200).json({
      completions,
      timeEntries,
    });
  } catch (error) {
    console.error("Error fetching routine history:", error);
    res.status(500).json({ message: "Failed to fetch routine history" });
  }
};

/**
 * Get routine statistics for current period
 * GET /roadmap/goals/:goalId/milestones/:milestoneId/routine/stats
 */
export const getRoutineStats: RequestHandler = async (req, res) => {
  const uid = req.user!.id;
  const { milestoneId } = req.params;

  try {
    // Get all completions for this milestone
    const completionsCommand = new QueryCommand({
      TableName: "routine_completions",
      KeyConditionExpression: "milestone_id = :milestoneId",
      ExpressionAttributeValues: {
        ":milestoneId": milestoneId,
      },
    });

    const completionsResult = await dynamodbClient.send(completionsCommand);
    const allCompletions = completionsResult.Items || [];

    // Get all time entries for this milestone
    const timeEntriesCommand = new QueryCommand({
      TableName: "routine_time_entries",
      KeyConditionExpression: "milestone_id = :milestoneId",
      ExpressionAttributeValues: {
        ":milestoneId": milestoneId,
      },
    });

    const timeEntriesResult = await dynamodbClient.send(timeEntriesCommand);
    const allTimeEntries = timeEntriesResult.Items || [];

    // Calculate current period stats (last 7 days, last 30 days, today)
    const now = Date.now();
    const oneDayMs = 86400000;
    const today = new Date().setHours(0, 0, 0, 0);
    const weekAgo = now - 7 * oneDayMs;
    const monthAgo = now - 30 * oneDayMs;

    const todayCompletions = allCompletions.filter(
      (c) => c.recorded_at >= today,
    ).length;
    const weekCompletions = allCompletions.filter(
      (c) => c.recorded_at >= weekAgo,
    ).length;
    const monthCompletions = allCompletions.filter(
      (c) => c.recorded_at >= monthAgo,
    ).length;

    const todayMinutes = allTimeEntries
      .filter((t) => t.recorded_at >= today)
      .reduce((sum, t) => sum + (t.duration_minutes || 0), 0);
    const weekMinutes = allTimeEntries
      .filter((t) => t.recorded_at >= weekAgo)
      .reduce((sum, t) => sum + (t.duration_minutes || 0), 0);
    const monthMinutes = allTimeEntries
      .filter((t) => t.recorded_at >= monthAgo)
      .reduce((sum, t) => sum + (t.duration_minutes || 0), 0);

    res.status(200).json({
      today: {
        completions: todayCompletions,
        minutes: todayMinutes,
      },
      week: {
        completions: weekCompletions,
        minutes: weekMinutes,
      },
      month: {
        completions: monthCompletions,
        minutes: monthMinutes,
      },
      total: {
        completions: allCompletions.length,
        minutes: allTimeEntries.reduce(
          (sum, t) => sum + (t.duration_minutes || 0),
          0,
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching routine stats:", error);
    res.status(500).json({ message: "Failed to fetch routine stats" });
  }
};
