import { Router } from "express";
import subcategory from "../controllers/subcategory";

const router = Router();

router.post("/", subcategory.createSubcategory);

router.get("/", subcategory.getSubcategories);

router.get("/:id", subcategory.getSubcategoryById);

router.delete("/:id", subcategory.deleteSubcategory);

export default router;
