import { Router } from "express";
import * as roadmap from "../controllers/roadmap";
import * as milestone from "../controllers/milestone";

const router = Router();

router.get("/goals", roadmap.listRoadmapGoals);
router.post("/goals", roadmap.createRoadmapGoal);

// Milestone routes
router.get("/goals/:goalId/milestones", milestone.listMilestones);
router.post("/goals/:goalId/milestones", milestone.createMilestone);
router.delete(
  "/goals/:goalId/milestones/:milestoneId",
  milestone.deleteMilestone
);

export default router;
