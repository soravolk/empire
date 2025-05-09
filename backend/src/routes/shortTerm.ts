import { Router } from "express";
import shortTerm from "../controllers/shortTerm";

const router = Router();

router.post("/", shortTerm.createShortTerm);

router.post("/:id/details", shortTerm.createDetail);

router.get("/", shortTerm.getShortTerms);

router.get("/:id/details", shortTerm.getDetailsFromShortTerm);

export default router;
