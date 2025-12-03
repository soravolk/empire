import { NextFunction } from "express";
import controller from "../../controllers/cycle";
import db from "../../db/utils";

describe("cycle controller", () => {
  let res: any;
  const cycleId = "test_cycle_id";
  const longTermId = "test_long_term_id";
  const userId = "test_user_id";
  const contentId = "test_content_id";
  const cycleContentId = "test_cycle_content_id";
  const startTime = "2025-01-01";
  const endTime = "2025-01-07";

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  afterEach(() => jest.clearAllMocks());

  describe("createCycle", () => {
    it("returns 201 with created row", async () => {
      const created = {
        id: cycleId,
        long_term_id: longTermId,
        start_time: startTime,
        end_time: endTime,
      };
      const spy = jest.spyOn(db, "insert").mockResolvedValue(created);

      const req = {
        body: {
          longTermId,
          startTime,
          endTime,
        },
      } as any;

      await controller.createCycle(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("cycles", {
        long_term_id: longTermId,
        start_time: startTime,
        end_time: endTime,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(created);
    });

    it("returns 500 when insert fails", async () => {
      const spy = jest
        .spyOn(db, "insert")
        .mockRejectedValue(new Error("db fail"));

      const req = {
        body: { longTermId, startTime, endTime },
      } as any;

      await controller.createCycle(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("cycles", {
        long_term_id: longTermId,
        start_time: startTime,
        end_time: endTime,
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });

  describe("getSubcategoriesFromCycle", () => {
    it("returns 200 with rows", async () => {
      const rows = [
        { id: "cs1", cycle_id: cycleId, subcategories_name: "Math" },
      ];
      const spy = jest
        .spyOn(db, "getFromInnerJoin")
        .mockResolvedValue({ rows });

      const req = { params: { id: cycleId } } as any;

      await controller.getSubcategoriesFromCycle(
        req,
        res,
        (() => {}) as NextFunction
      );

      expect(spy).toHaveBeenCalledWith(
        "cycle_subcategories",
        { cycle_id: cycleId },
        "subcategories",
        [["subcategory_id", "id"]]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it("returns 500 with raw error when getFromInnerJoin fails", async () => {
      const error = new Error("join fail");
      const spy = jest.spyOn(db, "getFromInnerJoin").mockRejectedValue(error);

      const req = { params: { id: cycleId } } as any;

      await controller.getSubcategoriesFromCycle(
        req,
        res,
        (() => {}) as NextFunction
      );

      expect(spy).toHaveBeenCalledWith(
        "cycle_subcategories",
        { cycle_id: cycleId },
        "subcategories",
        [["subcategory_id", "id"]]
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error });
    });
  });

  describe("getContentsFromCycle", () => {
    it("returns 200 with rows", async () => {
      const rows = [{ id: "cc1", cycle_id: cycleId, contents_name: "Read" }];
      const spy = jest
        .spyOn(db, "getFromInnerJoin")
        .mockResolvedValue({ rows });

      const req = { params: { id: cycleId } } as any;

      await controller.getContentsFromCycle(
        req,
        res,
        (() => {}) as NextFunction
      );

      expect(spy).toHaveBeenCalledWith(
        "cycle_contents",
        { cycle_id: cycleId },
        "contents",
        [["content_id", "id"]]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it("returns 500 with raw error when getFromInnerJoin fails", async () => {
      const error = new Error("join fail");
      const spy = jest.spyOn(db, "getFromInnerJoin").mockRejectedValue(error);

      const req = { params: { id: cycleId } } as any;

      await controller.getContentsFromCycle(
        req,
        res,
        (() => {}) as NextFunction
      );

      expect(spy).toHaveBeenCalledWith(
        "cycle_contents",
        { cycle_id: cycleId },
        "contents",
        [["content_id", "id"]]
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error });
    });
  });

  describe("getContentFromCycleById", () => {
    it("returns 200 with rows", async () => {
      const rows = [
        { id: cycleContentId, content_id: contentId, contents_name: "Study" },
      ];
      const spy = jest
        .spyOn(db, "getFromInnerJoin")
        .mockResolvedValue({ rows });

      const req = { params: { id: cycleContentId } } as any;

      await controller.getContentFromCycleById(
        req,
        res,
        (() => {}) as NextFunction
      );

      expect(spy).toHaveBeenCalledWith(
        "cycle_contents",
        { id: cycleContentId },
        "contents",
        [["content_id", "id"]]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it("returns 500 with raw error when getFromInnerJoin fails", async () => {
      const error = new Error("join fail");
      const spy = jest.spyOn(db, "getFromInnerJoin").mockRejectedValue(error);

      const req = { params: { id: cycleContentId } } as any;

      await controller.getContentFromCycleById(
        req,
        res,
        (() => {}) as NextFunction
      );

      expect(spy).toHaveBeenCalledWith(
        "cycle_contents",
        { id: cycleContentId },
        "contents",
        [["content_id", "id"]]
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error });
    });
  });

  describe("getCycles", () => {
    it("returns 200 with all cycles when no longTermId query param", async () => {
      const rows = [{ id: "c1" }, { id: "c2" }];
      const spy = jest.spyOn(db, "getAll").mockResolvedValue({ rows });

      const req = {
        query: {},
        user: { id: userId },
      } as any;

      await controller.getCycles(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("cycles", userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it("returns 200 with filtered cycles when longTermId query param present", async () => {
      const rows = [{ id: cycleId, long_term_id: longTermId }];
      const spy = jest
        .spyOn(db, "getWithCondition")
        .mockResolvedValue({ rows });

      const req = {
        query: { longTermId },
        user: { id: userId },
      } as any;

      await controller.getCycles(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("cycles", { long_term_id: longTermId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it("returns 500 when getAll fails", async () => {
      const spy = jest
        .spyOn(db, "getAll")
        .mockRejectedValue(new Error("db fail"));

      const req = {
        query: {},
        user: { id: userId },
      } as any;

      await controller.getCycles(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("cycles", userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });

  describe("deleteCycle", () => {
    it("returns 204 on success", async () => {
      const spy = jest.spyOn(db, "deleteById").mockResolvedValue();

      const req = { params: { id: cycleId } } as any;

      await controller.deleteCycle(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("cycles", cycleId);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("returns 500 when deleteById fails", async () => {
      const spy = jest
        .spyOn(db, "deleteById")
        .mockRejectedValue(new Error("db fail"));

      const req = { params: { id: cycleId } } as any;

      await controller.deleteCycle(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("cycles", cycleId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });

  describe("addContentToCycle", () => {
    it("returns 201 after inserting cycle-content link", async () => {
      const spy = jest.spyOn(db, "insert").mockResolvedValue({});

      const req = {
        params: { id: cycleId },
        body: { contentId },
      } as any;

      await controller.addContentToCycle(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("cycle_contents", {
        cycle_id: cycleId,
        content_id: contentId,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalled();
    });

    it("returns 500 when insert fails", async () => {
      const spy = jest
        .spyOn(db, "insert")
        .mockRejectedValue(new Error("db fail"));

      const req = {
        params: { id: cycleId },
        body: { contentId },
      } as any;

      await controller.addContentToCycle(req, res, (() => {}) as NextFunction);

      expect(spy).toHaveBeenCalledWith("cycle_contents", {
        cycle_id: cycleId,
        content_id: contentId,
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });

  describe("deleteContentFromCycle", () => {
    it("returns 204 on success", async () => {
      const spy = jest.spyOn(db, "deleteById").mockResolvedValue();

      const req = { params: { id: cycleContentId } } as any;

      await controller.deleteContentFromCycle(
        req,
        res,
        (() => {}) as NextFunction
      );

      expect(spy).toHaveBeenCalledWith("cycle_contents", cycleContentId);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("returns 500 when deleteById fails", async () => {
      const spy = jest
        .spyOn(db, "deleteById")
        .mockRejectedValue(new Error("db fail"));

      const req = { params: { id: cycleContentId } } as any;

      await controller.deleteContentFromCycle(
        req,
        res,
        (() => {}) as NextFunction
      );

      expect(spy).toHaveBeenCalledWith("cycle_contents", cycleContentId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });
});
