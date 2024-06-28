import { Router } from "express";
import cycle from "../controllers/cycle";

const router = Router();

router.post("/", cycle.createCycle);

// TODO: modify URL to match format of /cycles/categories
router.post("/:id/categories", cycle.addCategoryToCycle);

router.post("/:id/subcategories", cycle.addSubcategoryToCycle);

router.post("/:id/contents", cycle.addContentToCycle);

router.post("/", cycle.createCycle);

router.get("/", cycle.getCycles);

router.get("/:id", cycle.getCycle);

router.get("/:id/categories", cycle.getCategoriesFromCycle);

router.get("/:id/subcategories", cycle.getSubcategoriesFromCycle);

router.get("/:id/contents", cycle.getContentsFromCycle);

router.delete("/:id", cycle.deleteCycle);

router.delete("/categories/:id", cycle.deleteCategoryFromCycle);

export default router;
