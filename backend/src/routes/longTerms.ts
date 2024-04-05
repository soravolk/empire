import { Router } from "express";
import longTerms from "../controllers/longTerms";

const router = Router();

router.post("/", longTerms.createLongTerm);

router.get("/", longTerms.getLongTerms);

export default router;
