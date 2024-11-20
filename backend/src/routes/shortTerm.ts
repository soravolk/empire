import { Router } from "express";
import shortTerm from "../controllers/shortTerm";

const router = Router();

router.post("/", shortTerm.createShortTerm);

router.get("/", shortTerm.getShortTerms);

export default router;
