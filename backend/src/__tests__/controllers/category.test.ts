import { NextFunction } from "express";
import controller from "../../controllers/category";
import db from "../../db/utils";

describe("category controller", () => {
  let res: any;
  const categoryName = "Work";
  const categoryId = "123";
  const userId = "test_user_id";

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  afterEach(() => jest.clearAllMocks());

  describe("createCategory", () => {
    it("returns 201 and the created category row", async () => {
      const created = { id: categoryId, user_id: userId, name: categoryName };
      const spy = jest.spyOn(db, "insert").mockResolvedValue(created);

      const req = {
        body: { userId, name: categoryName },
      } as any;

      await controller.createCategory(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("categories", {
        user_id: userId,
        name: categoryName,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(created);
    });

    it("returns 500 when insert fails", async () => {
      const spy = jest
        .spyOn(db, "insert")
        .mockRejectedValue(new Error("db fail"));

      const req = {
        body: { userId, name: categoryName },
      } as any;

      await controller.createCategory(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("categories", {
        user_id: userId,
        name: categoryName,
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });

  describe("getCategoryById", () => {
    it("returns 200 with user-owned category row", async () => {
      const rows = [{ id: categoryId, user_id: userId, name: categoryName }];
      const spy = jest.spyOn(db, "getById").mockResolvedValue({ rows });

      const req = {
        params: { id: categoryId },
        user: { id: userId },
      } as any;

      await controller.getCategoryById(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("categories", categoryId, userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it("returns 400 when category ID is invalid", async () => {
      const req = {
        params: { id: "invalid_id" },
        user: { id: userId },
      } as any;

      await controller.getCategoryById(req, res, (() => {}) as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid category ID" });
    });

    it("returns 500 when getById fails", async () => {
      const spy = jest
        .spyOn(db, "getById")
        .mockRejectedValue(new Error("db fail"));

      const req = {
        params: { id: categoryId },
        user: { id: userId },
      } as any;

      await controller.getCategoryById(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("categories", categoryId, userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });

  describe("updateCategory", () => {
    it("returns 200 when category is updated", async () => {
      const updatedCategory = { id: categoryId, name: "Updated Name" };
      const spy = jest
        .spyOn(db, "updateById")
        .mockResolvedValue(updatedCategory);

      const req = {
        params: { id: categoryId },
        body: { name: "Updated Name" },
      } as any;

      await controller.updateCategory(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith(
        "categories",
        { name: "Updated Name" },
        categoryId,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedCategory);
    });

    it("returns 400 when category ID is invalid", async () => {
      const req = {
        params: { id: "invalid_id" },
        body: { name: "Updated Name" },
      } as any;

      await controller.updateCategory(req, res, (() => {}) as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid category ID" });
    });

    it("returns 400 when name is missing", async () => {
      const req = {
        params: { id: categoryId },
        body: {},
      } as any;

      await controller.updateCategory(req, res, (() => {}) as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Name is required" });
    });

    it("returns 400 when name is empty", async () => {
      const req = {
        params: { id: categoryId },
        body: { name: "   " },
      } as any;

      await controller.updateCategory(req, res, (() => {}) as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Name is required" });
    });

    it("returns 500 when updateById fails", async () => {
      const spy = jest
        .spyOn(db, "updateById")
        .mockRejectedValue(new Error("db fail"));

      const req = {
        params: { id: categoryId },
        body: { name: "Updated Name" },
      } as any;

      await controller.updateCategory(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith(
        "categories",
        { name: "Updated Name" },
        categoryId,
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });
});
