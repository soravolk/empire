import subtaskController from "../../controllers/subtask";
import db from "../../db/utils";

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("controllers/subtask", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createSubtask", () => {
    it("inserts subtask with correct args and returns 201 with result", async () => {
      const mockResult = { id: "sub-1" };
      const insertSpy = jest
        .spyOn(db, "insert")
        .mockResolvedValueOnce(mockResult as any);

      const req: any = {
        params: { taskId: "task-1" },
        body: { name: "Subtask 1", description: "desc" },
      };
      const res = createMockRes();
      const next = jest.fn();

      await subtaskController.createSubtask(req, res, next);

      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy).toHaveBeenCalledWith("subtasks", {
        task_id: "task-1",
        name: "Subtask 1",
        description: "desc",
        time_spent: 0,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("returns 500 with Internal server error on db error", async () => {
      jest.spyOn(db, "insert").mockRejectedValueOnce(new Error("db error"));

      const req: any = {
        params: { taskId: "task-1" },
        body: { name: "Subtask 1" },
      };
      const res = createMockRes();
      const next = jest.fn();

      await subtaskController.createSubtask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });

  describe("getSubtasksFromTask", () => {
    it("gets subtasks by task_id and returns 200 with rows", async () => {
      const rows = [{ id: "sub-1" }];
      const getSpy = jest
        .spyOn(db, "getWithCondition")
        .mockResolvedValueOnce({ rows } as any);

      const req: any = { params: { taskId: "task-1" } };
      const res = createMockRes();
      const next = jest.fn();

      await subtaskController.getSubtasksFromTask(req, res, next);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith("subtasks", { task_id: "task-1" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rows);
    });

    it("returns 500 on db error", async () => {
      jest
        .spyOn(db, "getWithCondition")
        .mockRejectedValueOnce(new Error("db error"));

      const req: any = { params: { taskId: "task-1" } };
      const res = createMockRes();
      const next = jest.fn();

      await subtaskController.getSubtasksFromTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });

  describe("updateSubtaskTimeSpent", () => {
    it("updates time_spent correctly and returns 200", async () => {
      const mockResult = { id: "sub-1", time_spent: 10 };
      const updateSpy = jest
        .spyOn(db, "updateById")
        .mockResolvedValueOnce(mockResult as any);

      const req: any = { params: { id: "sub-1" }, body: { timeSpent: 10 } };
      const res = createMockRes();
      const next = jest.fn();

      await subtaskController.updateSubtaskTimeSpent(req, res, next);

      expect(updateSpy).toHaveBeenCalledWith("subtasks", { time_spent: 10 }, "sub-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("returns 500 on db error", async () => {
      jest.spyOn(db, "updateById").mockRejectedValueOnce(new Error("db error"));

      const req: any = { params: { id: "sub-1" }, body: { timeSpent: 10 } };
      const res = createMockRes();
      const next = jest.fn();

      await subtaskController.updateSubtaskTimeSpent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });

  describe("updateSubtaskFinishedDate", () => {
    it("updates finished_date correctly and returns 200", async () => {
      const mockResult = { id: "sub-1", finished_date: "2025-01-01" };
      const updateSpy = jest
        .spyOn(db, "updateById")
        .mockResolvedValueOnce(mockResult as any);

      const req: any = {
        params: { id: "sub-1" },
        body: { finishedDate: "2025-01-01" },
      };
      const res = createMockRes();
      const next = jest.fn();

      await subtaskController.updateSubtaskFinishedDate(req, res, next);

      expect(updateSpy).toHaveBeenCalledWith(
        "subtasks",
        { finished_date: "2025-01-01" },
        "sub-1"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("returns 500 on db error", async () => {
      jest.spyOn(db, "updateById").mockRejectedValueOnce(new Error("db error"));

      const req: any = {
        params: { id: "sub-1" },
        body: { finishedDate: "2025-01-01" },
      };
      const res = createMockRes();
      const next = jest.fn();

      await subtaskController.updateSubtaskFinishedDate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });

  describe("updateSubtask", () => {
    it("updates name & description when provided", async () => {
      const mockResult = { id: "sub-1" };
      const updateSpy = jest
        .spyOn(db, "updateById")
        .mockResolvedValueOnce(mockResult as any);

      const req: any = {
        params: { id: "sub-1" },
        body: { name: "Updated", description: "New desc" },
      };
      const res = createMockRes();
      const next = jest.fn();

      await subtaskController.updateSubtask(req, res, next);

      expect(updateSpy).toHaveBeenCalledWith(
        "subtasks",
        { name: "Updated", description: "New desc" },
        "sub-1"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("updates only name if description undefined", async () => {
      const mockResult = { id: "sub-1" };
      const updateSpy = jest
        .spyOn(db, "updateById")
        .mockResolvedValueOnce(mockResult as any);

      const req: any = { params: { id: "sub-1" }, body: { name: "OnlyName" } };
      const res = createMockRes();
      const next = jest.fn();

      await subtaskController.updateSubtask(req, res, next);

      expect(updateSpy).toHaveBeenCalledWith(
        "subtasks",
        { name: "OnlyName" },
        "sub-1"
      );
    });

    it("returns 500 on db error", async () => {
      jest.spyOn(db, "updateById").mockRejectedValueOnce(new Error("db error"));

      const req: any = { params: { id: "sub-1" }, body: { name: "X" } };
      const res = createMockRes();
      const next = jest.fn();

      await subtaskController.updateSubtask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });

  describe("deleteSubtask", () => {
    it("deletes subtask with correct args and returns 204", async () => {
      const deleteSpy = jest
        .spyOn(db, "deleteById")
        .mockResolvedValueOnce(undefined as any);

      const req: any = { params: { id: "sub-1" } };
      const res = createMockRes();
      const next = jest.fn();

      await subtaskController.deleteSubtask(req, res, next);

      expect(deleteSpy).toHaveBeenCalledWith("subtasks", "sub-1");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith();
    });

    it("returns 500 with Internal server error on db error", async () => {
      jest.spyOn(db, "deleteById").mockRejectedValueOnce(new Error("db error"));

      const req: any = { params: { id: "sub-1" } };
      const res = createMockRes();
      const next = jest.fn();

      await subtaskController.deleteSubtask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });
});
