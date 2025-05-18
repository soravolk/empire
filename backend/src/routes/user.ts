import { Router, RequestHandler } from "express";
import { checkAuthentication } from "../middleware/auth";
import user from "../controllers/user";

const router = Router();

router.post("/", async (req, res) => {
  const { id, email, display_name } = req.body;
  try {
    user.createUser(id, email, display_name);
    res.status(201);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
});

router.get("/me", checkAuthentication, async (req, res) => {
  res.send(req.user);
});

export default router;
