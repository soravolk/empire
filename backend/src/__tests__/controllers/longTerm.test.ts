import controller from "../../controllers/longTerm";
import db from "../../db/utils";

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("controllers/longTerm", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createLongTerm", () => {
    it("inserts long term with correct args and returns 201", async () => {
      const insertSpy = jest.spyOn(db, "insert").mockResolvedValueOnce(undefined as any);

      const req: any = {
        body: {
          userId: "u1",
          startTime: "2025-01-01",
          endTime: "2025-12-31",
        },
      };
      const res = createMockRes();
      const next = jest.fn();

      await controller.createLongTerm(req, res, next);

      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy).toHaveBeenCalledWith("long_terms", {
        user_id: "u1",
        start_time: "2025-01-01",
        end_time: "2025-12-31",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith();
    });

    it("returns 500 on db error", async () => {
      jest.spyOn(db, "insert").mockRejectedValueOnce(new Error("db err"));

      const req: any = {
        body: { userId: "u1", startTime: "s", endTime: "e" },
      };
      const res = createMockRes();
      const next = jest.fn();

      await controller.createLongTerm(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });

  describe("getLongTerms", () => {
    it("gets all long terms for user and returns 200 with rows", async () => {
      const rows = [{ id: "lt1" }];
      const getAllSpy = jest.spyOn(db, "getAll").mockResolvedValueOnce({ rows } as any);

      const req: any = { user: { id: "u1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getLongTerms(req, res, next);

      expect(getAllSpy).toHaveBeenCalledTimes(1);
      expect(getAllSpy).toHaveBeenCalledWith("long_terms", "u1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it("returns 500 on db error", async () => {
      jest.spyOn(db, "getAll").mockRejectedValueOnce(new Error("db err"));

      const req: any = { user: { id: "u1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getLongTerms(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });

  describe("deleteLongTerm", () => {
    it("deletes long term with correct args and returns 204", async () => {
      const delSpy = jest.spyOn(db, "deleteById").mockResolvedValueOnce(undefined as any);

      const req: any = { params: { id: "lt1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.deleteLongTerm(req, res, next);

      expect(delSpy).toHaveBeenCalledTimes(1);
      expect(delSpy).toHaveBeenCalledWith("long_terms", "lt1");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith();
    });

    it("returns 500 on db error", async () => {
      jest.spyOn(db, "deleteById").mockRejectedValueOnce(new Error("db err"));

      const req: any = { params: { id: "lt1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.deleteLongTerm(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });

  describe("getCategoriesFromLongTerm", () => {
    it("joins categories by long_term_id and returns 200 with rows", async () => {
      const rows = [{ id: "c1" }];
      const joinSpy = jest
        .spyOn(db, "getFromInnerJoin")
        .mockResolvedValueOnce({ rows } as any);

      const req: any = { params: { id: "lt1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getCategoriesFromLongTerm(req, res, next);

      expect(joinSpy).toHaveBeenCalledTimes(1);
      expect(joinSpy).toHaveBeenCalledWith(
        "cycle_categories",
        { long_term_id: "lt1" },
        "categories",
        [["category_id", "id"]],
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it("returns 500 on db error", async () => {
      jest.spyOn(db, "getFromInnerJoin").mockRejectedValueOnce(new Error("db err"));

      const req: any = { params: { id: "lt1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getCategoriesFromLongTerm(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });

  describe("getSubcategoriesFromLongTerm", () => {
    it("joins subcategories by long_term_id and returns 200 with rows", async () => {
      const rows = [{ id: "sc1" }];
      const joinSpy = jest
        .spyOn(db, "getFromInnerJoin")
        .mockResolvedValueOnce({ rows } as any);

      const req: any = { params: { id: "lt1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getSubcategoriesFromLongTerm(req, res, next);

      expect(joinSpy).toHaveBeenCalledTimes(1);
      expect(joinSpy).toHaveBeenCalledWith(
        "cycle_subcategories",
        { long_term_id: "lt1" },
        "subcategories",
        [["subcategory_id", "id"]],
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it("returns 500 on db error", async () => {
      jest.spyOn(db, "getFromInnerJoin").mockRejectedValueOnce(new Error("db err"));

      const req: any = { params: { id: "lt1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getSubcategoriesFromLongTerm(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });

  describe("addCategoryToLongTerm", () => {
    it("inserts cycle_categories with correct args and returns 201", async () => {
      const insertSpy = jest.spyOn(db, "insert").mockResolvedValueOnce(undefined as any);

      const req: any = { params: { id: "lt1" }, body: { categoryId: "c1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.addCategoryToLongTerm(req, res, next);

      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy).toHaveBeenCalledWith("cycle_categories", {
        long_term_id: "lt1",
        category_id: "c1",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith();
    });

    it("returns 500 on db error", async () => {
      jest.spyOn(db, "insert").mockRejectedValueOnce(new Error("db err"));

      const req: any = { params: { id: "lt1" }, body: { categoryId: "c1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.addCategoryToLongTerm(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });

  describe("addSubcategoryToLongTerm", () => {
    it("inserts cycle_subcategories with correct args and returns 201", async () => {
      const insertSpy = jest.spyOn(db, "insert").mockResolvedValueOnce(undefined as any);

      const req: any = { params: { id: "lt1" }, body: { subcategoryId: "sc1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.addSubcategoryToLongTerm(req, res, next);

      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy).toHaveBeenCalledWith("cycle_subcategories", {
        long_term_id: "lt1",
        subcategory_id: "sc1",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith();
    });

    it("returns 500 on db error", async () => {
      jest.spyOn(db, "insert").mockRejectedValueOnce(new Error("db err"));

      const req: any = { params: { id: "lt1" }, body: { subcategoryId: "sc1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.addSubcategoryToLongTerm(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });

  describe("deleteCategoryFromLongTerm", () => {
    it("deletes mapping from cycle_categories and returns 204", async () => {
      const delSpy = jest.spyOn(db, "deleteById").mockResolvedValueOnce(undefined as any);

      const req: any = { params: { id: "map1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.deleteCategoryFromLongTerm(req, res, next);

      expect(delSpy).toHaveBeenCalledTimes(1);
      expect(delSpy).toHaveBeenCalledWith("cycle_categories", "map1");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith();
    });

    it("returns 500 on db error", async () => {
      jest.spyOn(db, "deleteById").mockRejectedValueOnce(new Error("db err"));

      const req: any = { params: { id: "map1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.deleteCategoryFromLongTerm(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });

  describe("deleteSubcategoryFromLongTerm", () => {
    it("deletes mapping from cycle_subcategories and returns 204", async () => {
      const delSpy = jest.spyOn(db, "deleteById").mockResolvedValueOnce(undefined as any);

      const req: any = { params: { id: "map2" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.deleteSubcategoryFromLongTerm(req, res, next);

      expect(delSpy).toHaveBeenCalledTimes(1);
      expect(delSpy).toHaveBeenCalledWith("cycle_subcategories", "map2");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith();
    });

    it("returns 500 on db error", async () => {
      jest.spyOn(db, "deleteById").mockRejectedValueOnce(new Error("db err"));

      const req: any = { params: { id: "map2" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.deleteSubcategoryFromLongTerm(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
    });
  });
});
