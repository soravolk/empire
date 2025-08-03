import { Router } from "express";
import task from "../controllers/task";

const router = Router();

router.get("/", task.getTasks);

export default router;
