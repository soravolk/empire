import { Router, RequestHandler } from "express";
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

router.get("/", async (req, res) => {
  try {
    res.status(200).json(await user.getUsers());
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    res.status(200).json(await user.getUserById(id));
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
});

export default router;
