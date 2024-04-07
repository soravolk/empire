import { Router } from "express";
import cycle from "../controllers/cycle";

const router = Router();

router.post("/", cycle.createCycle);

router.get("/", cycle.getCycles);

router.get("/:id", cycle.getCycle);

router.delete("/:id", cycle.deleteCycle);

export default router;
