import { Router } from "express";
import users from "../controllers/users";

const router = Router();

router.post("/", users.createUser);

router.get("/", users.getUsers);

export default router;
