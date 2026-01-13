import { Router } from "express";
import task from "../controllers/task";
import subtask from "../controllers/subtask";

const router = Router();

// Task routes
router.post("/", task.createTask);

// Subtask routes - these need to be defined here since the frontend API calls /tasks/:taskId/subtasks
router.post("/:taskId/subtasks", subtask.createSubtask);
router.get("/:taskId/subtasks", subtask.getSubtasksFromTask);
router.put("/subtasks/:id/time-spent", subtask.updateSubtaskTimeSpent);
router.put("/subtasks/:id/finished-date", subtask.updateSubtaskFinishedDate);
router.put("/subtasks/:id", subtask.updateSubtask);
router.delete("/subtasks/:id", subtask.deleteSubtask);

export default router;
