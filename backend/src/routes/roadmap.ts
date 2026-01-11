import { Router } from "express";
import * as roadmap from "../controllers/roadmap";

const router = Router();

router.get("/goals", roadmap.listRoadmapGoals);
router.post("/goals", roadmap.createRoadmapGoal);
router.put("/goals/:goal_id", roadmap.updateRoadmapGoal);
router.delete("/goals/:goal_id", roadmap.deleteRoadmapGoal);

export default router;
