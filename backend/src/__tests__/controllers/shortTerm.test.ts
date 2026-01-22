import controller from "../../controllers/shortTerm";
import db from "../../db/utils";

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("controllers/shortTerm", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createShortTerm", () => {
    it("inserts short term with correct args and returns 201 with result", async () => {
      const mockResult = { id: "st-1" };
      const insertSpy = jest
        .spyOn(db, "insert")
        .mockResolvedValueOnce(mockResult as any);

      const req: any = { body: { userId: "user-1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.createShortTerm(req, res, next);

      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy).toHaveBeenCalledWith("short_terms", { user_id: "user-1" });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(mockResult);
    });

    it("returns 500 with internal server error on db error", async () => {
      jest.spyOn(db, "insert").mockRejectedValueOnce(new Error("db error"));

      const req: any = { body: { userId: "user-1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.createShortTerm(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "internal server error",
      });
    });
  });

  describe("createTask", () => {
    it("inserts task with correct args and returns 201 with result", async () => {
      const mockResult = { id: "task-1" };
      const insertSpy = jest
        .spyOn(db, "insert")
        .mockResolvedValueOnce(mockResult as any);

      const req: any = {
        params: { id: "st-1" },
        body: { contentId: "content-1" },
      };
      const res = createMockRes();
      const next = jest.fn();

      await controller.createTask(req, res, next);

      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy).toHaveBeenCalledWith("tasks", {
        content_id: "content-1",
        short_term_id: "st-1",
        time_spent: 0,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(mockResult);
    });

    it("returns 500 with raw error on db error", async () => {
      const error = new Error("db error");
      jest.spyOn(db, "insert").mockRejectedValueOnce(error);

      const req: any = {
        params: { id: "st-1" },
        body: { contentId: "content-1" },
      };
      const res = createMockRes();
      const next = jest.fn();

      await controller.createTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error });
    });
  });

  describe("getShortTerms", () => {
    it("gets all short terms for the user and returns 200 with rows", async () => {
      const rows = [{ id: "st-1" }];
      const getAllSpy = jest
        .spyOn(db, "getAll")
        .mockResolvedValueOnce({ rows } as any);

      const req: any = { user: { id: "user-1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getShortTerms(req, res, next);

      expect(getAllSpy).toHaveBeenCalledTimes(1);
      expect(getAllSpy).toHaveBeenCalledWith("short_terms", "user-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it("returns 500 with internal server error on db error", async () => {
      jest.spyOn(db, "getAll").mockRejectedValueOnce(new Error("db error"));

      const req: any = { user: { id: "user-1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getShortTerms(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "internal server error",
      });
    });
  });

  describe("getTasksFromShortTerm", () => {
    it("gets tasks by short_term_id and returns 200 with rows", async () => {
      const rows = [{ id: "task-1" }];
      const getWithConditionSpy = jest
        .spyOn(db, "getWithCondition")
        .mockResolvedValueOnce({ rows } as any);

      const req: any = { params: { id: "st-1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getTasksFromShortTerm(req, res, next);

      expect(getWithConditionSpy).toHaveBeenCalledTimes(1);
      expect(getWithConditionSpy).toHaveBeenCalledWith("tasks", {
        short_term_id: "st-1",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it("returns 500 with internal server error on db error", async () => {
      jest
        .spyOn(db, "getWithCondition")
        .mockRejectedValueOnce(new Error("db error"));

      const req: any = { params: { id: "st-1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.getTasksFromShortTerm(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "internal server error",
      });
    });
  });

  describe("updateTaskTimeSpent", () => {
    it("updates time_spent with correct args and returns 200 with result", async () => {
      const mockResult = { id: "task-1", time_spent: 10 };
      const updateSpy = jest
        .spyOn(db, "updateById")
        .mockResolvedValueOnce(mockResult as any);

      const req: any = {
        params: { id: "task-1" },
        body: { timeSpent: 10 },
      };
      const res = createMockRes();
      const next = jest.fn();

      await controller.updateTaskTimeSpent(req, res, next);

      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith(
        "tasks",
        { time_spent: 10 },
        "task-1",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("returns 500 with raw error on db error", async () => {
      const error = new Error("db error");
      jest
        .spyOn(db, "updateById")
        .mockRejectedValueOnce(error);

      const req: any = {
        params: { id: "task-1" },
        body: { timeSpent: 10 },
      };
      const res = createMockRes();
      const next = jest.fn();

      await controller.updateTaskTimeSpent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error });
    });
  });

  describe("updateTaskFinishedDate", () => {
    it("updates finished_date with correct args and returns 200 with result", async () => {
      const mockResult = { id: "task-1", finished_date: "2025-01-01" };
      const updateSpy = jest
        .spyOn(db, "updateById")
        .mockResolvedValueOnce(mockResult as any);

      const req: any = {
        params: { id: "task-1" },
        body: { finishedDate: "2025-01-01" },
      };
      const res = createMockRes();
      const next = jest.fn();

      await controller.updateTaskFinishedDate(req, res, next);

      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith(
        "tasks",
        { finished_date: "2025-01-01" },
        "task-1",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("returns 500 with raw error on db error", async () => {
      const error = new Error("db error");
      jest
        .spyOn(db, "updateById")
        .mockRejectedValueOnce(error);

      const req: any = {
        params: { id: "task-1" },
        body: { finishedDate: "2025-01-01" },
      };
      const res = createMockRes();
      const next = jest.fn();

      await controller.updateTaskFinishedDate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error });
    });
  });

  describe("deleteShortTerm", () => {
    it("deletes short term with correct args and returns 204", async () => {
      const deleteSpy = jest
        .spyOn(db, "deleteById")
        .mockResolvedValueOnce(undefined as any);

      const req: any = { params: { id: "st-1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.deleteShortTerm(req, res, next);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith("short_terms", "st-1");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith();
    });

    it("returns 500 with internal server error on db error", async () => {
      jest
        .spyOn(db, "deleteById")
        .mockRejectedValueOnce(new Error("db error"));

      const req: any = { params: { id: "st-1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.deleteShortTerm(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "internal server error",
      });
    });
  });

  describe("deleteShortTermTask", () => {
    it("deletes task with correct args and returns 204", async () => {
      const deleteSpy = jest
        .spyOn(db, "deleteById")
        .mockResolvedValueOnce(undefined as any);

      const req: any = { params: { id: "task-1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.deleteShortTermTask(req, res, next);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith("tasks", "task-1");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith();
    });

    it("returns 500 with internal server error on db error", async () => {
      jest
        .spyOn(db, "deleteById")
        .mockRejectedValueOnce(new Error("db error"));

      const req: any = { params: { id: "task-1" } };
      const res = createMockRes();
      const next = jest.fn();

      await controller.deleteShortTermTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "internal server error",
      });
    });
  });
});