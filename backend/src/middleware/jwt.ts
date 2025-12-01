import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

function getTokenFromAuthHeader(req: Request): string | null {
  const auth = req.headers["authorization"] || req.headers["Authorization"];
  if (!auth || Array.isArray(auth)) return null;
  const [scheme, token] = auth.split(" ");
  if (scheme && scheme.toLowerCase() === "bearer" && token) return token;
  return null;
}

function getTokenFromCookie(req: Request): string | null {
  const cookieHeader = req.headers["cookie"];
  if (!cookieHeader || Array.isArray(cookieHeader)) return null;
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
    const decoded = jwt.verify(token, secret) as JwtPayload | string;
    const payload = typeof decoded === "string" ? { sub: decoded } : decoded;
    // Attach minimal user and full payload
    req.user = { id: String((payload as any).sub) } as any;
    (res.locals as any).authPayload = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
