import { NextFunction } from "express";
import controller from "../../controllers/task";
import db from "../../db/utils";

describe("task controller", () => {
    let res: any;
    const userId = "test_user_id";

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => jest.clearAllMocks());

    describe("getDetails", () => {
        it("returns 200 with user-owned task rows", async () => {
            const rows = [
                { id: 1, user_id: userId, title: "T1" },
                { id: 2, user_id: userId, title: "T2" },
            ];
            const spy = jest.spyOn(db, "getAll").mockResolvedValue({ rows } as any);

            const req = { user: { id: userId } } as any;
            await controller.getDetails(req, res, (() => {}) as NextFunction);

            expect(spy).toHaveBeenCalledWith("tasks", userId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(rows);
        });

        it("returns 500 when getAll fails", async () => {
            const spy = jest.spyOn(db, "getAll").mockRejectedValue(new Error("db fail"));

            const req = { user: { id: userId } } as any;
            await controller.getDetails(req, res, (() => {}) as NextFunction);

            expect(spy).toHaveBeenCalledWith("tasks", userId);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
        });
    });
});



