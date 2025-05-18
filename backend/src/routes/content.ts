import { Router } from "express";
import content from "../controllers/content";

const router = Router();

router.post("/", content.createContent);

router.get("/:id", content.getContentById);

export default router;
