import { Router } from "express";
import shortTerm from "../controllers/shortTerm";

const router = Router();

router.post("/", shortTerm.createShortTerm);

router.post("/:id/details", shortTerm.createDetail);

router.get("/", shortTerm.getShortTerms);

router.get("/:id/details", shortTerm.getDetailsFromShortTerm);

router.put("/details/:id/time-spent", shortTerm.updateDetailTimeSpent);

router.put("/details/:id/finished-date", shortTerm.updateDetailFinishedDate);

router.delete("/:id", shortTerm.deleteShortTerm);

export default router;
