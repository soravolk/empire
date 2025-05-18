import { Router } from "express";
import category from "../controllers/category";

const router = Router();

router.post("/", category.createCategory);

router.get("/:id", category.getCategoryById);

export default router;
