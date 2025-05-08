import { Router } from "express";
import category from "../controllers/category";

const router = Router();

router.post("/", category.createCategory);

router.get("/", category.getCategories);

router.get("/:id", category.getCategoryById);

router.delete("/:id", category.deleteCategory);

export default router;
