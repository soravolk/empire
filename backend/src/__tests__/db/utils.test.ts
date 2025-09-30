// Mock pg module used by utils
jest.mock("../../db/postgre", () => ({
  __esModule: true,
  pg: { query: jest.fn() },
}));

import db from "../../db/utils";
import * as postgre from "../../db/postgre";

const queryMock = (postgre.pg as any).query as jest.Mock;

describe("db/utils", () => {
  afterEach(() => jest.clearAllMocks());

  describe("insert", () => {
    it("builds INSERT with placeholders and returns rows[0]", async () => {
      queryMock.mockResolvedValue({ rows: [{ id: "1", name: "Work" }] });
      const row = await db.insert("categories", {
        user_id: "u1",
        name: "Work",
      });

      expect(queryMock).toHaveBeenCalledTimes(1);

      const [sql, params] = queryMock.mock.calls[0];

      expect(sql).toContain(
        "INSERT INTO categories(user_id,name) VALUES ($1,$2) RETURNING *"
      );
      expect(params).toEqual(["u1", "Work"]);
      expect(row).toEqual({ id: "1", name: "Work" });
    });
  });

  describe("ownership-aware queries", () => {
    it("getById builds JOINs to users and filters by uid then id", async () => {
      queryMock.mockResolvedValue({ rows: [{ id: "c1" }] });
      await db.getById("cycles", "c1", "u1");
      const [sql, params] = queryMock.mock.calls[0];

      expect(sql).toContain("FROM cycles");
      expect(sql).toContain("JOIN long_terms");
      expect(sql).toContain("JOIN users");
      expect(sql).toContain("users.id = $1");
      expect(sql).toContain("cycles.id = $2");
      expect(params).toEqual(["u1", "c1"]);
    });

    it("getAll builds JOINs and filters by uid only", async () => {
      queryMock.mockResolvedValue({ rows: [{ id: "c1" }, { id: "c2" }] });
      await db.getAll("cycles", "u1");
      const [sql, params] = queryMock.mock.calls[0];

      expect(sql).toContain("FROM cycles");
      expect(sql).toContain("JOIN long_terms");
      expect(sql).toContain("JOIN users");
      expect(sql).toContain("users.id = $1");
      expect(params).toEqual(["u1"]);
    });
  });

  describe("getWithCondition", () => {
    it("handles conditions with non-array value", async () => {
      queryMock.mockResolvedValue({ rows: [] });
      await db.getWithCondition("tasks", { user_id: "u1", done: false });
      const [sql, params] = queryMock.mock.calls[0];

      expect(sql).toContain(
        "SELECT * FROM tasks WHERE user_id = $1 AND done = $2"
      );
      expect(params).toEqual(["u1", false]);
    });

    it("handles NULL correctly without adding params", async () => {
      queryMock.mockResolvedValue({ rows: [] });
      await db.getWithCondition("tasks", { archived_at: null });
      const [sql, params] = queryMock.mock.calls[0];

      expect(sql).toContain("archived_at IS NULL");
      expect(params).toEqual([]);
    });

    it("handles conditions with array of strings via ANY(::text[])", async () => {
      queryMock.mockResolvedValue({ rows: [] });
      await db.getWithCondition("contents", { id: ["a", "b"] });
      const [sql, params] = queryMock.mock.calls[0];

      expect(sql).toContain("id = ANY($1::text[])");
      expect(params).toEqual([["a", "b"]]);
    });

    it("handles conditions with array of numbers via ANY(::int[])", async () => {
      queryMock.mockResolvedValue({ rows: [] });
      await db.getWithCondition("contents", { order: [1, 2, 3] });
      const [sql, params] = queryMock.mock.calls[0];

      expect(sql).toContain("order = ANY($1::int[])");
      expect(params).toEqual([[1, 2, 3]]);
    });

    it("empty array returns empty rows and does not query", async () => {
      const res = await db.getWithCondition("contents", { id: [] });

      expect(res).toEqual({ rows: [] });
      expect(queryMock).not.toHaveBeenCalled();
    });

    it("no conditions returns SELECT * and empty params", async () => {
      queryMock.mockResolvedValue({ rows: [{ id: "1" }] });
      await db.getWithCondition("contents", {});
      const [sql, params] = queryMock.mock.calls[0];

      expect(sql.trim()).toEqual("SELECT * FROM contents");
      expect(params).toEqual([]);
    });
  });

  describe("getFromInnerJoin", () => {
    it("selects columns (excluding id) and joins with where placeholders", async () => {
      // First call: getColumnNamesWithoutId
      queryMock
        .mockResolvedValueOnce({
          rows: [{ column_name: "name" }, { column_name: "created_at" }],
        })
        // Second call: actual inner join query
        .mockResolvedValueOnce({
          rows: [{ id: "cc1", contents_name: "Read" }],
        });

      await db.getFromInnerJoin(
        "cycle_contents",
        { cycle_id: "c1" },
        "contents",
        [["content_id", "id"]]
      );

      expect(queryMock).toHaveBeenCalledTimes(2);

      const [sql2, params2] = queryMock.mock.calls[1];

      expect(sql2).toContain(
        "SELECT cycle_contents.*, contents.name,contents.created_at"
      );
      expect(sql2).toContain("FROM cycle_contents");
      expect(sql2).toContain("INNER JOIN contents");
      expect(sql2).toContain("ON (cycle_contents.content_id = contents.id)");
      expect(sql2).toContain("WHERE (cycle_contents.cycle_id = $1)");
      expect(params2).toEqual(["c1"]);
    });
  });

  describe("deleteById", () => {
    it("builds DELETE by id with $1", async () => {
      queryMock.mockResolvedValue({});
      await db.deleteById("cycles", "c1");
      const [sql, params] = queryMock.mock.calls[0];

      expect(sql.trim()).toEqual("DELETE FROM cycles WHERE id = $1");
      expect(params).toEqual(["c1"]);
    });
  });

  describe("deleteWithCondition", () => {
    it("handles conditions with non-array value and returns rowCount", async () => {
      queryMock.mockResolvedValue({ rowCount: 3 });
      const count = await db.deleteWithCondition("contents", {
        subcategory_id: "sc1",
      });
      const [sql, params] = queryMock.mock.calls[0];

      expect(sql).toContain("DELETE FROM contents WHERE subcategory_id = $1");
      expect(params).toEqual(["sc1"]);
      expect(count).toBe(3);
    });

    it("handles conditions with NULL and array of numbers", async () => {
      queryMock.mockResolvedValue({ rowCount: 1 });
      await db.deleteWithCondition("contents", {
        order: [1, 2],
        deleted_at: null,
      });
      const [sql, params] = queryMock.mock.calls[0];

      expect(sql).toContain("order = ANY($1::int[]) AND deleted_at IS NULL");
      expect(params).toEqual([[1, 2]]);
    });

    it("handles conditions with empty array and does not query", async () => {
      const count = await db.deleteWithCondition("contents", { id: [] });

      expect(count).toBe(0);
      expect(queryMock).not.toHaveBeenCalled();
    });
  });

  describe("updateById", () => {
    it("updates columns of data with given id and returns a single entry of data", async () => {
      queryMock.mockResolvedValue({ rows: [{ id: "c1", name: "New" }] });
      const row = await db.updateById(
        "contents",
        { name: "New", order: 2 },
        "c1"
      );
      const [sql, params] = queryMock.mock.calls[0];

      expect(sql).toContain(
        "UPDATE contents SET name = $1, order = $2 WHERE id = $3 RETURNING *"
      );
      expect(params).toEqual(["New", 2, "c1"]);
      expect(row).toEqual({ id: "c1", name: "New" });
    });
  });
});
