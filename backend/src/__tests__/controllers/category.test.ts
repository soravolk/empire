import { Request, Response, NextFunction } from "express";
import controller from "../../controllers/category";
import db from "../../db/utils";

describe("category controller", () => {
  const makeRes = () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    } as unknown as Response & {
      status: jest.Mock;
      send: jest.Mock;
      json: jest.Mock;
    };
    return res;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("createCategory returns 201 with created row", async () => {
    const created = { id: "1", user_id: "u1", name: "Work" };
    const spy = jest.spyOn(db as any, "insert").mockResolvedValue(created);

    const req = {
      body: { userId: "u1", name: "Work" },
    } as unknown as Request;
    const res = makeRes();

    await controller.createCategory(req, res, (() => {}) as NextFunction);

    expect(spy).toHaveBeenCalledWith("categories", {
      user_id: "u1",
      name: "Work",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(created);
  });

  it("getCategoryById returns 200 with rows for the user", async () => {
    const rows = [{ id: "5", user_id: "u1", name: "Study" }];
    const spy = jest.spyOn(db as any, "getById").mockResolvedValue({ rows });

    const req = {
      params: { id: "5" },
      user: { id: "u1" },
    } as unknown as Request & { user: { id: string } };
    const res = makeRes();

    await controller.getCategoryById(req, res, (() => {}) as NextFunction);

    expect(spy).toHaveBeenCalledWith("categories", "5", "u1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(rows);
  });
});
