import { Router } from "express";
import detail from "../controllers/detail";

const router = Router();

router.get("/", detail.getDetails);

export default router;
