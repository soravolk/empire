import { NextFunction } from "express";
import controller from "../../controllers/subcategory";
import db from "../../db/utils";

describe("subcategory controller", () => {
  let res: any;
  const userId = "test_user_id";
  const subcategoryId = "test_subcategory_id";
  const categoryId = 7;
  const subcategoryName = "Test Subcategory";

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  afterEach(() => jest.clearAllMocks());

  describe("createSubcategory", () => {
    it("returns 201 and the created subcategory row", async () => {
      const created = {
        id: subcategoryId,
        category_id: categoryId,
        name: subcategoryName,
      };
      const spy = jest.spyOn(db, "insert").mockResolvedValue(created as any);

      const req = { body: { categoryId, name: subcategoryName } } as any;

      await controller.createSubcategory(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("subcategories", {
        category_id: categoryId,
        name: subcategoryName,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(created);
    });

    it("returns 500 when insert fails", async () => {
      const spy = jest.spyOn(db, "insert").mockRejectedValue(new Error("db fail"));

      const req = { body: { categoryId, name: subcategoryName } } as any;

      await controller.createSubcategory(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("subcategories", {
        category_id: categoryId,
        name: subcategoryName,
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });

  describe("getSubcategoryById", () => {
    it("returns 200 with user-owned subcategory rows", async () => {
      const rows = [
        { id: subcategoryId, category_id: categoryId, name: subcategoryName },
      ];
      const spy = jest.spyOn(db, "getById").mockResolvedValue({ rows } as any);

      const req = { params: { id: subcategoryId }, user: { id: userId } } as any;

      await controller.getSubcategoryById(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("subcategories", subcategoryId, userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it("returns 500 when getById fails", async () => {
      const spy = jest.spyOn(db, "getById").mockRejectedValue(new Error("db fail"));

      const req = { params: { id: subcategoryId }, user: { id: userId } } as any;

      await controller.getSubcategoryById(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("subcategories", subcategoryId, userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });
});
