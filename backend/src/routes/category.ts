import { Router } from "express";
import category from "../controllers/category";

const router = Router();

router.post("/", category.createCategory);

router.get("/:id", category.getCategoryById);

router.put("/:id", category.updateCategory);

export default router;
