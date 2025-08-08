import { RequestHandler } from "express";
import db from "../db/utils";

const createSubtask: RequestHandler = async (req, res) => {
  const { taskId: task_id } = req.params;
  const { name, description } = req.body;

  try {
    const result = await db.insert("subtasks", {
      task_id,
      name,
      description: description || null,
      time_spent: 0,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating subtask:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSubtasksFromTask: RequestHandler = async (req, res) => {
  const { taskId: task_id } = req.params;

  try {
    const { rows } = await db.getWithCondition("subtasks", { task_id });
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateSubtaskTimeSpent: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { timeSpent: time_spent } = req.body;

  try {
    const result = await db.updateById("subtasks", { time_spent }, id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating subtask time spent:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateSubtaskFinishedDate: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { finishedDate: finished_date } = req.body;

  try {
    const result = await db.updateById("subtasks", { finished_date }, id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating subtask finished date:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateSubtask: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const result = await db.updateById("subtasks", updateData, id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating subtask:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteSubtask: RequestHandler = async (req, res) => {
  const { id } = req.params;

  try {
    await db.deleteById("subtasks", id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting subtask:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const subtaskController = {
  createSubtask,
  getSubtasksFromTask,
  updateSubtaskTimeSpent,
  updateSubtaskFinishedDate,
  updateSubtask,
  deleteSubtask,
};

export default subtaskController;
