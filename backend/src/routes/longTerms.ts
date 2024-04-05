import { Router } from "express";
import { getLongTerms } from "../controllers/longTerms";

const router = Router();

router.get("/", getLongTerms);

export default router;
