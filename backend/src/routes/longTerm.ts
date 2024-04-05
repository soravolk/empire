import { Router } from "express";
import longTerm from "../controllers/longTerm";

const router = Router();

router.post("/", longTerm.createLongTerm);

router.get("/", longTerm.getLongTerms);

export default router;
