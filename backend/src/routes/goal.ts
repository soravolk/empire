import { Router } from "express";
import * as goal from "../controllers/goal";

const router = Router();

router.get("/", goal.listGoals);
router.post("/", goal.createGoal);
router.patch("/:id", goal.updateGoal);
router.delete("/:id", goal.deleteGoal);
router.post("/:id/categories", goal.linkCategories);
router.delete("/:id/categories", goal.unlinkCategories);

export default router;
