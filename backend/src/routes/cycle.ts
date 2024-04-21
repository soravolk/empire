import { Router } from "express";
import cycle from "../controllers/cycle";

const router = Router();

router.post("/", cycle.createCycle);

router.post("/:id/categories", cycle.addCategoryToCycle);

router.post("/:id/subcategories", cycle.addSubcategoryToCycle);

router.post("/:id/contents", cycle.addContentToCycle);

router.post("/", cycle.createCycle);

router.get("/", cycle.getCycles);

router.get("/:id", cycle.getCycle);

router.get("/:id/categories", cycle.getCategoriesFromCycle);

router.delete("/:id", cycle.deleteCycle);

export default router;
