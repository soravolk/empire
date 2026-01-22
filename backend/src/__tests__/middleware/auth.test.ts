import type { Request, Response, NextFunction } from "express";

jest.mock("../../controllers/user", () => ({
  __esModule: true,
  default: {
    getUserById: jest.fn(),
    createUser: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    verify: jest.fn(),
  },
}));

import jwt from "jsonwebtoken";
import user from "../../controllers/user";
import { requireJwt, ensureUser } from "../../middleware/auth";

describe("middleware/auth", () => {
  const ORIGINAL_ENV = { ...process.env };

  let res: any;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV, JWT_SECRET: "test-secret" };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {},
    };

    next = jest.fn();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe("requireJwt", () => {
    it("returns 500 when JWT_SECRET is missing", () => {
      delete process.env.JWT_SECRET;

      const req = { headers: {} } as unknown as Request;
      requireJwt(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "JWT not configured" });
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when no token is provided", () => {
      const req = { headers: {} } as unknown as Request;

      requireJwt(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(next).not.toHaveBeenCalled();
    });

    it("accepts bearer token from Authorization header and calls next", () => {
      (jwt.verify as unknown as jest.Mock).mockReturnValueOnce({ sub: "benson" });

      const req = {
        headers: { authorization: "Bearer token-123" },
      } as unknown as Request;

      requireJwt(req, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith("token-123", "test-secret");
      expect((req as any).user).toEqual({ id: "benson" });
      expect(res.locals.authPayload).toEqual({ sub: "benson" });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("accepts token from cookie header when Authorization header is missing", () => {
      (jwt.verify as unknown as jest.Mock).mockReturnValueOnce({ sub: "volk" });

      const req = {
        headers: { cookie: "a=1; empire.jwt=cookie-token%20123; b=2" },
      } as unknown as Request;

      requireJwt(req, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith("cookie-token 123", "test-secret");
      expect((req as any).user).toEqual({ id: "volk" });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("returns 401 when jwt.verify throws", () => {
      (jwt.verify as unknown as jest.Mock).mockImplementationOnce(() => {
        throw new Error("bad token");
      });

      const req = {
        headers: { authorization: "Bearer bad" },
      } as unknown as Request;

      requireJwt(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid or expired token",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when authorization header is an array", () => {
      const req = {
        headers: { authorization: ["Bearer x"] as any },
      } as unknown as Request;

      requireJwt(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("ensureUser", () => {
    it("calls next immediately when no authPayload/sub", async () => {
      res.locals = {};
      const req = {} as Request;

      await ensureUser(req, res as Response, next);

      expect(user.getUserById).not.toHaveBeenCalled();
      expect(user.createUser).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("does nothing when user exists", async () => {
      res.locals = { authPayload: { sub: "benson" } };
      (user.getUserById as jest.Mock).mockResolvedValueOnce({ id: "benson" });

      const req = {} as Request;
      await ensureUser(req, res as Response, next);

      expect(user.getUserById).toHaveBeenCalledWith("benson");
      expect(user.createUser).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("creates user when not exists and payload has email+name", async () => {
      res.locals = {
        authPayload: { sub: "volk", email: "volk@test.com", name: "Volk" },
      };
      (user.getUserById as jest.Mock).mockResolvedValueOnce(null);
      (user.createUser as jest.Mock).mockResolvedValueOnce(undefined);

      const req = {} as Request;
      await ensureUser(req, res as Response, next);

      expect(user.getUserById).toHaveBeenCalledWith("volk");
      expect(user.createUser).toHaveBeenCalledWith(
        "volk",
        "volk@test.com",
        "Volk"
      );
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("swallows createUser error and still calls next", async () => {
      res.locals = {
        authPayload: { sub: "u1", email: "u1@test.com", name: "U1" },
      };
      (user.getUserById as jest.Mock).mockResolvedValueOnce(null);
      (user.createUser as jest.Mock).mockRejectedValueOnce(
        new Error("db down")
      );

      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const req = {} as Request;
      await ensureUser(req, res as Response, next);

      expect(user.createUser).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);

      warnSpy.mockRestore();
    });

    it("swallows getUserById error and still calls next", async () => {
      res.locals = { authPayload: { sub: "u2" } };
      (user.getUserById as jest.Mock).mockRejectedValueOnce(
        new Error("db error")
      );

      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const req = {} as Request;
      await ensureUser(req, res as Response, next);

      expect(user.getUserById).toHaveBeenCalledWith("u2");
      expect(next).toHaveBeenCalledTimes(1);

      warnSpy.mockRestore();
    });
  });
});
