import { Request, Response, NextFunction } from "express";
import user from "../controllers/user";

export async function ensureUser(req: Request, res: Response, next: NextFunction) {
  const payload: any = (res.locals as any).authPayload || {};
  const id = String(payload.sub || "");
  if (!id) return next();

  try {
    const existing = await user.getUserById(id);
    if (!existing) {
      if (payload.email && payload.name) {
        try {
          await user.createUser(id, payload.email, payload.name);
        } catch (err) {
          // swallow create errors to avoid blocking API; will retry next request
          console.warn("ensureUser: createUser failed", err);
        }
      }
    }
  } catch (err) {
    // Ignore lookup errors to avoid auth failure; downstream queries will error if truly missing
    console.warn("ensureUser: getUserById failed", err);
  }
  return next();
}
