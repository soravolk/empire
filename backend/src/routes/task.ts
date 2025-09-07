import { Router } from "express";
import subtask from "../controllers/subtask";

const router = Router();

// Subtask routes - these need to be defined here since the frontend API calls /tasks/:taskId/subtasks
router.post("/:taskId/subtasks", subtask.createSubtask);
router.get("/:taskId/subtasks", subtask.getSubtasksFromTask);
router.put("/subtasks/:id/time-spent", subtask.updateSubtaskTimeSpent);
router.put("/subtasks/:id/finished-date", subtask.updateSubtaskFinishedDate);
router.put("/subtasks/:id", subtask.updateSubtask);
router.delete("/subtasks/:id", subtask.deleteSubtask);

export default router;
