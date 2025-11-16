import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import user from "../controllers/user";

function getTokenFromAuthHeader(req: Request): string | null {
  const auth = req.headers["authorization"] || req.headers["Authorization"];
  if (!auth || Array.isArray(auth)) return null;

  const [scheme, token] = auth.split(" ");
  if (scheme && scheme.toLowerCase() === "bearer" && token) return token;

  return null;
}

function getTokenFromCookie(req: Request): string | null {
  const cookieHeader = req.headers["cookie"];
  if (!cookieHeader) return null;

  const pairs = cookieHeader.split(";").map((c) => c.trim());
  for (const p of pairs) {
    const idx = p.indexOf("=");
    if (idx === -1) continue;

    const key = decodeURIComponent(p.slice(0, idx));
    if (key === "empire.jwt") {
      return decodeURIComponent(p.slice(idx + 1));
    }
  }

  return null;
}

export function requireJwt(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "JWT not configured" });
  }

  const token = getTokenFromAuthHeader(req) || getTokenFromCookie(req);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: String(payload.sub) };
    res.locals.authPayload = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export async function ensureUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const payload: any = res.locals.authPayload || {};
  const id = String(payload.sub || "");
  if (!id) return next();

  try {
    const existing = await user.getUserById(id);
    if (!existing) {
      if (payload.email && payload.name) {
        try {
          await user.createUser(id, payload.email, payload.name);
        } catch (err) {
          // TODO: reconsider error handling here, for now we swallow create errors to avoid blocking API; will retry next request
          console.warn("ensureUser: createUser failed", err);
        }
      }
    }
  } catch (err) {
    // TODO: reconsider error handling here, for now we ignore lookup errors to avoid auth failure; downstream queries will error if truly missing
    console.warn("ensureUser: getUserById failed", err);
  }
  return next();
}
