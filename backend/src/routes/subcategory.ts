import { Router } from "express";
import subcategory from "../controllers/subcategory";

const router = Router();

router.post("/", subcategory.createSubcategory);

router.get("/:id", subcategory.getSubcategoryById);

export default router;
