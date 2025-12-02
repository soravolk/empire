import {   listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  linkCategories,
  unlinkCategories, } from "../../controllers/goal";
import db from "../../db/utils";

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("controllers/goal → listGoals", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should fetch and return sorted goals with aggregated category_ids when ownership check passes", async () => {
    // 1. Mock ownership check
    const getByIdSpy = jest
      .spyOn(db, "getById")
      .mockResolvedValueOnce({ rows: [{}] } as any);

    // 2. Mock goals and category link data
    const goals = [
      { id: 1, title: "A", updated_at: "2025-01-02T00:00:00Z", user_id: "u1", long_term_id: "LT1" },
      { id: 2, title: "B", updated_at: "2025-01-03T00:00:00Z", user_id: "u1", long_term_id: "LT1" },
    ];
    const links = [
      { goal_id: 1, category_id: 10 },
      { goal_id: 2, category_id: 20 },
      { goal_id: 2, category_id: 21 },
    ];
    const getWithConditionSpy = jest
      .spyOn(db, "getWithCondition")
      .mockResolvedValueOnce({ rows: goals } as any) // first: goals
      .mockResolvedValueOnce({ rows: links } as any); // second: goal_category_links

    const req: any = { query: { longTermId: "LT1" }, user: { id: "u1" } };
    const res = createMockRes();
    const next = jest.fn();

    await listGoals(req, res, next);

    // --- verify db calls
    expect(getByIdSpy).toHaveBeenCalledWith("long_terms", "LT1", "u1");
    expect(getWithConditionSpy).toHaveBeenNthCalledWith(1, "goals", {
      long_term_id: "LT1",
      user_id: "u1",
    });
    expect(getWithConditionSpy).toHaveBeenNthCalledWith(2, "goal_category_links", {
      goal_id: [1, 2],
    });

    // --- verify sorted + aggregated output
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { ...goals[1], category_ids: [20, 21] },
      { ...goals[0], category_ids: [10] },
    ]);
  });

  it("should return an empty array if there are no goals for the long term", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{}] } as any);
    const getWithConditionSpy = jest
      .spyOn(db, "getWithCondition")
      .mockResolvedValueOnce({ rows: [] } as any);

    const req: any = { query: { longTermId: "LT1" }, user: { id: "u1" } };
    const res = createMockRes();
    const next = jest.fn();

    await listGoals(req, res, next);

    expect(getWithConditionSpy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("should return 404 if ownership validation fails (long term not found)", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [] } as any);
    const getWithConditionSpy = jest.spyOn(db, "getWithCondition").mockResolvedValue({ rows: [] } as any);

    const req: any = { query: { longTermId: "LT1" }, user: { id: "u1" } };
    const res = createMockRes();
    const next = jest.fn();

    await listGoals(req, res, next);

    expect(getWithConditionSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "not found" });
  });

  it("should return 500 if an error occurs during ownership validation", async () => {
    jest.spyOn(db, "getById").mockRejectedValueOnce(new Error("db failure"));

    const req: any = { query: { longTermId: "LT1" }, user: { id: "u1" } };
    const res = createMockRes();
    const next = jest.fn();

    await listGoals(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
  });

  it("should return 500 if an error occurs while fetching goals", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{}] } as any);
    jest.spyOn(db, "getWithCondition").mockRejectedValueOnce(new Error("query failed"));

    const req: any = { query: { longTermId: "LT1" }, user: { id: "u1" } };
    const res = createMockRes();
    const next = jest.fn();

    await listGoals(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "internal server error" });
  });
});

describe("controllers/goal → createGoal", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const uid = "user-1";

  const createMockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  it("should return 400 when statement is empty or whitespace", async () => {
    const req: any = {
      user: { id: uid },
      body: {
        longTermId: 1,
        statement: "    ", // becomes empty after trim()
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    await createGoal(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "invalid statement" });
  });

  it("should return 400 when statement exceeds 280 characters", async () => {
    const longStatement = "a".repeat(281);
    const req: any = {
      user: { id: uid },
      body: {
        longTermId: 1,
        statement: longStatement,
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    await createGoal(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "invalid statement" });
  });

  it("should create a goal without categories when under cap and no categoryIds provided", async () => {
    // ownership OK
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{}] } as any);
    // existing goals count < GOAL_CAP_PER_LONG_TERM
    const countRows = [{ id: 1 }, { id: 2 }];
    const getWithConditionSpy = jest
      .spyOn(db, "getWithCondition")
      .mockResolvedValueOnce({ rows: countRows } as any); // only called once (for count)

    const createdGoal = {
      id: 123,
      user_id: uid,
      long_term_id: 1,
      statement: "my goal",
    };
    const insertSpy = jest
      .spyOn(db, "insert")
      .mockResolvedValueOnce(createdGoal as any); // for goals insert

    const req: any = {
      user: { id: uid },
      body: {
        longTermId: 1,
        statement: "my goal",
        // no categoryIds
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    await createGoal(req, res, next);

    // ownership check
    expect(db.getById).toHaveBeenCalledWith("long_terms", "1", uid);

    // count existing goals
    expect(getWithConditionSpy).toHaveBeenCalledTimes(1);
    expect(getWithConditionSpy).toHaveBeenCalledWith("goals", {
      long_term_id: 1,
      user_id: uid,
    });

    // insert goal
    expect(insertSpy).toHaveBeenCalledWith("goals", {
      user_id: uid,
      long_term_id: 1,
      statement: "my goal",
    });

    // no category link queries / inserts
    expect(db.getWithCondition).toHaveBeenCalledTimes(1);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(createdGoal);
  });

  it("should create a goal and link categories when categoryIds are unique and no existing links", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{}] } as any);

    // existing goals below cap
    jest
      .spyOn(db, "getWithCondition")
      .mockResolvedValueOnce({ rows: [] } as any) // countRows: 0
      .mockResolvedValueOnce({ rows: [] } as any); // existing links: none

    const createdGoal = {
      id: 456,
      user_id: uid,
      long_term_id: 1,
      statement: "with categories",
    };

    const insertSpy = jest
      .spyOn(db, "insert")
      .mockResolvedValueOnce(createdGoal as any) // insert goal
      .mockResolvedValueOnce(undefined as any) // first category link
      .mockResolvedValueOnce(undefined as any); // second category link

    const req: any = {
      user: { id: uid },
      body: {
        longTermId: 1,
        statement: "with categories",
        categoryIds: [10, 20],
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    await createGoal(req, res, next);

    // count existing goals
    expect(db.getWithCondition).toHaveBeenNthCalledWith(1, "goals", {
      long_term_id: 1,
      user_id: uid,
    });

    // pre-check links
    expect(db.getWithCondition).toHaveBeenNthCalledWith(2, "goal_category_links", {
      goal_id: createdGoal.id,
      category_id: [10, 20],
    });

    // insert goal
    expect(insertSpy).toHaveBeenNthCalledWith(1, "goals", {
      user_id: uid,
      long_term_id: 1,
      statement: "with categories",
    });

    // insert each link
    expect(insertSpy).toHaveBeenNthCalledWith(2, "goal_category_links", {
      goal_id: createdGoal.id,
      category_id: 10,
    });
    expect(insertSpy).toHaveBeenNthCalledWith(3, "goal_category_links", {
      goal_id: createdGoal.id,
      category_id: 20,
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(createdGoal);
  });

  it("should return 400 when payload contains duplicate categoryIds", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{}] } as any);

    // existing goals below cap
    jest
      .spyOn(db, "getWithCondition")
      .mockResolvedValueOnce({ rows: [] } as any); // only for count

    const createdGoal = {
      id: 789,
      user_id: uid,
      long_term_id: 1,
      statement: "duplicate categories",
    };
    jest
      .spyOn(db, "insert")
      .mockResolvedValueOnce(createdGoal as any); // insert goal

    const req: any = {
      user: { id: uid },
      body: {
        longTermId: 1,
        statement: "duplicate categories",
        categoryIds: [10, 10], // duplicates
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    await createGoal(req, res, next);

    // should NOT call link pre-check or link insert
    expect(db.getWithCondition).toHaveBeenCalledTimes(1); // only goals count
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "duplicate category_ids in payload",
    });
  });

  it("should return 409 when category links already exist in pre-check", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{}] } as any);

    // count existing goals
    jest
      .spyOn(db, "getWithCondition")
      .mockResolvedValueOnce({ rows: [] } as any) // count: 0
      .mockResolvedValueOnce({
        rows: [{ goal_id: 999, category_id: 10 }],
      } as any); // existing link

    const createdGoal = {
      id: 999,
      user_id: uid,
      long_term_id: 1,
      statement: "conflict",
    };
    jest
      .spyOn(db, "insert")
      .mockResolvedValueOnce(createdGoal as any); // insert goal only

    const req: any = {
      user: { id: uid },
      body: {
        longTermId: 1,
        statement: "conflict",
        categoryIds: [10],
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    await createGoal(req, res, next);

    // no link inserts should be performed
    expect(db.insert).toHaveBeenCalledTimes(1); // only goal insert
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "category link already exists",
      category_ids: [10],
    });
  });

  it("should return 409 when a category link insert hits a unique-violation error", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{}] } as any);

    jest
      .spyOn(db, "getWithCondition")
      .mockResolvedValueOnce({ rows: [] } as any) // count
      .mockResolvedValueOnce({ rows: [] } as any); // pre-check: no existing

    const createdGoal = {
      id: 1000,
      user_id: uid,
      long_term_id: 1,
      statement: "unique violation",
    };
    const insertSpy = jest
      .spyOn(db, "insert")
      .mockResolvedValueOnce(createdGoal as any) // insert goal
      .mockRejectedValueOnce({ code: "23505" } as any); // unique violation on first link

    const req: any = {
      user: { id: uid },
      body: {
        longTermId: 1,
        statement: "unique violation",
        categoryIds: [10],
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    await createGoal(req, res, next);

    expect(insertSpy).toHaveBeenCalledTimes(2); // goal + failing link
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "category link already exists",
      category_ids: [10],
    });
  });

  it("should return 400 when goal cap per long term is reached", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{}] } as any);

    // simulate existingCount >= GOAL_CAP_PER_LONG_TERM (10)
    const countRows = new Array(10).fill({ id: 1 });
    jest
      .spyOn(db, "getWithCondition")
      .mockResolvedValueOnce({ rows: countRows } as any);

    const req: any = {
      user: { id: uid },
      body: {
        longTermId: 1,
        statement: "cap reached",
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    await createGoal(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "goal cap reached",
    });
    // ensure goal insert never happens
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("should return 404 when ownership validation fails", async () => {
    // ensureOwnershipByLongTerm will throw 404 because rows: []
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [] } as any);

    const req: any = {
      user: { id: uid },
      body: {
        longTermId: 1,
        statement: "some goal",
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    await createGoal(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "not found" });
  });

  it("should return 500 when an unexpected error occurs", async () => {
    // ownership OK
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{}] } as any);
    // error occurs during goal insert
    jest
      .spyOn(db, "getWithCondition")
      .mockResolvedValueOnce({ rows: [] } as any); // count: 0

    jest
      .spyOn(db, "insert")
      .mockRejectedValueOnce(new Error("unexpected insert error"));

    const req: any = {
      user: { id: uid },
      body: {
        longTermId: 1,
        statement: "boom",
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    await createGoal(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "internal server error",
    });
  });
});

describe("controllers/goal → updateGoal", () => {
  const uid = "user-1";

  const createMockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return 400 when statement is empty or whitespace", async () => {
    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { statement: "   " },
    };
    const res = createMockRes();
    const next = jest.fn();

    await updateGoal(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "invalid statement" });
    expect(db.getById).not.toHaveBeenCalled();
  });

  it("should return 400 when statement exceeds 280 characters", async () => {
    const longStatement = "a".repeat(281);
    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { statement: longStatement },
    };
    const res = createMockRes();
    const next = jest.fn();

    await updateGoal(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "invalid statement" });
    expect(db.getById).not.toHaveBeenCalled();
  });

  it("should update goal statement when ownership check passes", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{ id: 10 }] } as any);
    const updatedGoal = { id: 10, statement: "updated" };
    const updateSpy = jest
      .spyOn(db, "updateById")
      .mockResolvedValueOnce(updatedGoal as any);

    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { statement: " updated " }, // trimmed
    };
    const res = createMockRes();
    const next = jest.fn();

    await updateGoal(req, res, next);

    expect(db.getById).toHaveBeenCalledWith("goals", "10", uid);
    expect(updateSpy).toHaveBeenCalledWith("goals", { statement: "updated" }, "10");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedGoal);
  });

  it("should return 404 when goal is not found for the user", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [] } as any);

    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { statement: "some text" },
    };
    const res = createMockRes();
    const next = jest.fn();

    await updateGoal(req, res, next);

    expect(db.updateById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "not found" });
  });

  it("should return 500 when an unexpected error occurs", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{ id: 10 }] } as any);
    jest
      .spyOn(db, "updateById")
      .mockRejectedValueOnce(new Error("update failed"));

    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { statement: "boom" },
    };
    const res = createMockRes();
    const next = jest.fn();

    await updateGoal(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "internal server error",
    });
  });
});

describe("controllers/goal → deleteGoal", () => {
  const uid = "user-1";

  const createMockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should delete goal when ownership check passes", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{ id: 10 }] } as any);
    const deleteSpy = jest
      .spyOn(db, "deleteById")
      .mockResolvedValueOnce(undefined as any);

    const req: any = {
      user: { id: uid },
      params: { id: "10" },
    };
    const res = createMockRes();
    const next = jest.fn();

    await deleteGoal(req, res, next);

    expect(db.getById).toHaveBeenCalledWith("goals", "10", uid);
    expect(deleteSpy).toHaveBeenCalledWith("goals", "10");
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith();
  });

  it("should return 404 when goal does not belong to the user", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [] } as any);

    const req: any = {
      user: { id: uid },
      params: { id: "10" },
    };
    const res = createMockRes();
    const next = jest.fn();

    await deleteGoal(req, res, next);

    expect(db.deleteById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "not found" });
  });

  it("should return 500 when an unexpected error occurs", async () => {
    jest
      .spyOn(db, "getById")
      .mockRejectedValueOnce(new Error("db failure"));

    const req: any = {
      user: { id: uid },
      params: { id: "10" },
    };
    const res = createMockRes();
    const next = jest.fn();

    await deleteGoal(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "internal server error",
    });
  });
});

describe("controllers/goal → linkCategories", () => {
  const uid = "user-1";

  const createMockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return 400 when categoryIds is missing or empty", async () => {
    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { categoryIds: [] },
    };
    const res = createMockRes();
    const next = jest.fn();

    await linkCategories(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "categoryIds required",
    });
    expect(db.getById).not.toHaveBeenCalled();
  });

  it("should return 404 when goal is not found for the user", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [] } as any);

    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { categoryIds: [1, 2] },
    };
    const res = createMockRes();
    const next = jest.fn();

    await linkCategories(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "not found" });
  });

  it("should return 400 when payload contains duplicate categoryIds", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{ id: 10 }] } as any);

    jest
      .spyOn(db, "getWithCondition")
      .mockResolvedValueOnce({ rows: [] } as any); // we should never get here, but harmless

    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { categoryIds: [1, 1] },
    };
    const res = createMockRes();
    const next = jest.fn();

    await linkCategories(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "duplicate category_ids in payload",
    });
  });

  it("should return 409 when category links already exist in pre-check", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{ id: 10 }] } as any);

    jest
      .spyOn(db, "getWithCondition")
      .mockResolvedValueOnce({ rows: [{ id: 1 }] } as any); // existing links

    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { categoryIds: [5] },
    };
    const res = createMockRes();
    const next = jest.fn();

    await linkCategories(req, res, next);

    expect(db.insert).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "category link already exists",
      category_ids: [expect.anything()], // category_id from existing rows
    });
  });

  it("should link categories and return 204 when everything succeeds", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{ id: 10 }] } as any);

    jest
      .spyOn(db, "getWithCondition")
      .mockResolvedValueOnce({ rows: [] } as any) // pre-check: no existing links
      .mockResolvedValueOnce({ rows: [] } as any); // (this second call may not exist depending on your actual usage, safe to keep one)

    const insertSpy = jest
      .spyOn(db, "insert")
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { categoryIds: [1, 2] },
    };
    const res = createMockRes();
    const next = jest.fn();

    await linkCategories(req, res, next);

    expect(db.getWithCondition).toHaveBeenCalledWith(
      "goal_category_links",
      { goal_id: 10, category_id: [1, 2] }
    );

    expect(insertSpy).toHaveBeenNthCalledWith(1, "goal_category_links", {
      goal_id: 10,
      category_id: 1,
    });
    expect(insertSpy).toHaveBeenNthCalledWith(2, "goal_category_links", {
      goal_id: 10,
      category_id: 2,
    });

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith();
  });

  it("should return 409 when a category link insert hits a unique-violation error", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{ id: 10 }] } as any);

    jest
      .spyOn(db, "getWithCondition")
      .mockResolvedValueOnce({ rows: [] } as any); // pre-check

    const insertSpy = jest
      .spyOn(db, "insert")
      .mockRejectedValueOnce({ code: "23505" } as any); // unique violation

    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { categoryIds: [5] },
    };
    const res = createMockRes();
    const next = jest.fn();

    await linkCategories(req, res, next);

    expect(insertSpy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "category link already exists",
      category_ids: [5],
    });
  });

  it("should return 500 when an unexpected error occurs", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{ id: 10 }] } as any);
    jest
      .spyOn(db, "getWithCondition")
      .mockResolvedValueOnce({ rows: [] } as any);

    jest
      .spyOn(db, "insert")
      .mockRejectedValueOnce(new Error("unexpected"));


    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { categoryIds: [5] },
    };
    const res = createMockRes();
    const next = jest.fn();

    await linkCategories(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "internal server error",
    });
  });
});

describe("controllers/goal → unlinkCategories", () => {
  const uid = "user-1";

  const createMockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return 400 when categoryIds is missing or empty", async () => {
    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { categoryIds: [] },
    };
    const res = createMockRes();
    const next = jest.fn();

    await unlinkCategories(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "category_ids required",
    });
    expect(db.getById).not.toHaveBeenCalled();
  });

  it("should return 404 when goal is not found for the user", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [] } as any);

    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { categoryIds: [1, 2] },
    };
    const res = createMockRes();
    const next = jest.fn();

    await unlinkCategories(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "not found" });
  });

  it("should delete category links and return 204 when ownership check passes", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{ id: 10 }] } as any);
    const deleteSpy = jest
      .spyOn(db, "deleteWithCondition")
      .mockResolvedValueOnce(undefined as any);

    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { categoryIds: [1, 2] },
    };
    const res = createMockRes();
    const next = jest.fn();

    await unlinkCategories(req, res, next);

    expect(deleteSpy).toHaveBeenCalledWith("goal_category_links", {
      goal_id: 10,
      category_id: [1, 2],
    });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith();
  });

  it("should return 500 when an unexpected error occurs", async () => {
    jest.spyOn(db, "getById").mockResolvedValueOnce({ rows: [{ id: 10 }] } as any);
    jest
      .spyOn(db, "deleteWithCondition")
      .mockRejectedValueOnce(new Error("db error"));

    const req: any = {
      user: { id: uid },
      params: { id: "10" },
      body: { categoryIds: [1] },
    };
    const res = createMockRes();
    const next = jest.fn();

    await unlinkCategories(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "internal server error",
    });
  });
});
