import { Router } from "express";
import * as roadmap from "../controllers/roadmap";
import * as milestone from "../controllers/milestone";
import * as routine from "../controllers/routine";

const router = Router();

router.get("/goals", roadmap.listRoadmapGoals);
router.post("/goals", roadmap.createRoadmapGoal);
router.put("/goals/:goal_id", roadmap.updateRoadmapGoal);
router.delete("/goals/:goal_id", roadmap.deleteRoadmapGoal);

// Milestone routes
router.get("/goals/:goalId/milestones", milestone.listMilestones);
router.post("/goals/:goalId/milestones", milestone.createMilestone);
router.put("/goals/:goalId/milestones/:milestoneId", milestone.updateMilestone);
router.delete(
  "/goals/:goalId/milestones/:milestoneId",
  milestone.deleteMilestone,
);

// Routine tracking routes
router.post(
  "/goals/:goalId/milestones/:milestoneId/routine/complete",
  routine.addRoutineCompletion,
);
router.post(
  "/goals/:goalId/milestones/:milestoneId/routine/time",
  routine.addRoutineTime,
);
router.get(
  "/goals/:goalId/milestones/:milestoneId/routine/history",
  routine.getRoutineHistory,
);
router.get(
  "/goals/:goalId/milestones/:milestoneId/routine/stats",
  routine.getRoutineStats,
);

export default router;
