import { Router } from "express";
import user from "../controllers/user";

const router = Router();

router.post("/", user.createUser);

router.get("/", user.getUsers);

export default router;
