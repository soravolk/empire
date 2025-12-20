import { Router } from "express";
import user from "../controllers/user";

const router = Router();

router.post("/", async (req, res) => {
  const { id, email, display_name } = req.body;
  if (!id || !email || !display_name) {
    // TODO: handle validation through middleware
    return res.status(400).json({ error: "id, email, display_name required" });
  }

  try {
    await user.createUser(id, email, display_name);
    return res.status(201).json();
  } catch (error) {
    return res.status(500).json({ error: "internal server error" });
  }
});

router.get("/me", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "unauthorized" });
  }

  let record = null;
  try {
    record = await user.getUserById(req.user.id);
  } catch (e) {
    return res.status(500).send({ error: "internal server error" });
  }

  if (!record) {
    return res.status(404).json({ error: "user not found" });
  }

  return res.json({
    id: req.user.id,
    email: record.email,
    name: record.display_name,
  });
});

export default router;
