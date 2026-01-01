import { Router } from "express";
import * as roadmap from "../controllers/roadmap";

const router = Router();

router.get("/goals", roadmap.listRoadmapGoals);

export default router;
