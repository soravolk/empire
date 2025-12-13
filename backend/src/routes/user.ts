import { Router } from "express";
import user from "../controllers/user";

const router = Router();

router.post("/", async (req, res) => {
  const { id, email, display_name } = req.body;
  if (!id || !email || !display_name) {
    return res.status(400).json({ error: "id, email, display_name required" });
  }
  try {
    await user.createUser(id, email, display_name);
    const created = await user.getUserById(id);
    res.status(201).json(created || { id, email, display_name });
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
});

router.get("/me", async (req, res) => {
  // requireJwt ran earlier in app.ts, so req.user should exist
  if (!req.user) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const payload: any = (res.locals as any).authPayload || {};
  let record = null;
  try {
    record = await user.getUserById(req.user.id);
  } catch (e) {
    // ignore; may not exist yet
  }
  res.json({
    id: req.user.id,
    email: payload.email || record?.email,
    name: payload.name || record?.display_name,
    display_name: record?.display_name,
    picture: payload.picture,
    provider: payload.provider,
    existsInDb: !!record,
  });
});

export default router;
