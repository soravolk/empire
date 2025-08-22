import { Router } from "express";
import longTerm from "../controllers/longTerm";

const router = Router();

router.post("/", longTerm.createLongTerm);

router.get("/", longTerm.getLongTerms);

router.get("/:id/categories", longTerm.getCategoriesFromLongTerm);
router.post("/:id/categories", longTerm.addCategoryToLongTerm);
router.get("/:id/subcategories", longTerm.getSubcategoriesFromLongTerm);
router.post("/:id/subcategories", longTerm.addSubcategoryToLongTerm);
router.delete("/categories/:id", longTerm.deleteCategoryFromLongTerm);

router.delete("/:id", longTerm.deleteLongTerm);

export default router;
