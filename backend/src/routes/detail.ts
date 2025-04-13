import { Router } from "express";
import detail from "../controllers/detail";

const router = Router();

router.post("/", detail.createDetail);

export default router;
