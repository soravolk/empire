import { NextFunction } from "express";
import controller from "../../controllers/content";
import db from "../../db/utils";

describe("content controller", () => {
  let res: any;
  const contentName = "Test Content";
  const subcategoryId = "test_subcategory_id";
  const contentId = "test_content_id";
  const userId = "test_user_id";

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  }

  afterEach(() => jest.clearAllMocks());

  describe("createContent", () => {
    it("returns 201 and the created content row", async () => {
      const created = {
        id: contentId,
        subcategory_id: subcategoryId,
        name: contentName,
      };
      const spy = jest.spyOn(db, "insert").mockResolvedValue(created);

      const req = {
        body: { subcategoryId, name: contentName },
      } as any;

      await controller.createContent(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("contents", {
        subcategory_id: subcategoryId,
        name: contentName,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(created);
    });

    it("returns 500 with raw error object when insert fails", async () => {
      const err = new Error("db fail");
      jest.spyOn(db, "insert").mockRejectedValue(err);

      const req = {
        body: { subcategoryId, name: contentName },
      } as any;

      await controller.createContent(req, res, (() => {}) as NextFunction);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: err });
    });
  });

  describe("getContentById", () => {
    it("returns 200 with user-owned content rows", async () => {
      const rows = [
        { id: contentId, subcategory_id: subcategoryId, name: contentName },
      ];
      const spy = jest.spyOn(db, "getById").mockResolvedValue({ rows });
      const req = {
        params: { id: contentId },
        user: { id: userId },
      } as any;

      await controller.getContentById(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("contents", contentId, userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it("returns 500 with standardized error payload when db call fails", async () => {
      const spy = jest
        .spyOn(db, "getById")
        .mockRejectedValue(new Error("DB error"));

      const req = {
        params: { id: contentId },
        user: { id: userId },
      } as any;

      await controller.getContentById(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("contents", contentId, userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });
});
