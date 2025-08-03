import { Router } from "express";
import shortTerm from "../controllers/shortTerm";

const router = Router();

router.post("/", shortTerm.createShortTerm);

router.post("/:id/tasks", shortTerm.createTask);

router.get("/", shortTerm.getShortTerms);

router.get("/:id/tasks", shortTerm.getTasksFromShortTerm);

router.put("/tasks/:id/time-spent", shortTerm.updateTaskTimeSpent);

router.put("/tasks/:id/finished-date", shortTerm.updateTaskFinishedDate);

router.delete("/tasks/:id", shortTerm.deleteShortTermTask);

router.delete("/:id", shortTerm.deleteShortTerm);

export default router;
