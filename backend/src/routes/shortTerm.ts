import { Router } from "express";
import shortTerm from "../controllers/shortTerm";

const router = Router();

router.get("/", shortTerm.getShortTerms);

export default router;
