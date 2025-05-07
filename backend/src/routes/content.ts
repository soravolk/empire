import { Router } from "express";
import content from "../controllers/content";

const router = Router();

router.post("/", content.createContent);

router.get("/", content.getContents);

router.get("/:id", content.getContentById);

router.delete("/:id", content.deleteContent);

export default router;
