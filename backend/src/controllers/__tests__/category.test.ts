import request from "supertest";
import express, { Express } from "express";
import categoryRouter from "../../routes/category";
import db from "../../db/utils";

// Mock the database module
jest.mock("../../db/utils");

const mockDb = db as jest.Mocked<typeof db>;

describe("Category Controller - updateCategory", () => {
  let app: Express;

  beforeEach(() => {
    // Setup Express app for testing
    app = express();
    app.use(express.json());
    app.use("/categories", categoryRouter);

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("PUT /categories/:id", () => {
    it("should update category successfully with valid data", async () => {
      const now = new Date();
      const mockUpdatedCategory = {
        id: 1,
        name: "Updated Category",
        user_id: "user123",
        created_at: now,
        updated_at: now,
      };

      mockDb.updateById.mockResolvedValue(mockUpdatedCategory);

      const response = await request(app)
        .put("/categories/1")
        .send({ name: "Updated Category" })
        .expect(200);

      expect(response.body).toEqual({
        ...mockUpdatedCategory,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      });
      expect(mockDb.updateById).toHaveBeenCalledWith(
        "categories",
        { name: "Updated Category" },
        "1",
      );
    });

    it("should trim whitespace from category name", async () => {
      mockDb.updateById.mockResolvedValue({});

      await request(app)
        .put("/categories/1")
        .send({ name: "  Trimmed Name  " })
        .expect(200);

      expect(mockDb.updateById).toHaveBeenCalledWith(
        "categories",
        { name: "Trimmed Name" },
        "1",
      );
    });

    it("should return 400 for invalid category ID", async () => {
      const response = await request(app)
        .put("/categories/invalid")
        .send({ name: "Test Category" })
        .expect(400);

      expect(response.body).toEqual({ error: "Invalid category ID" });
      expect(mockDb.updateById).not.toHaveBeenCalled();
    });

    it("should return 400 when name is missing", async () => {
      const response = await request(app)
        .put("/categories/1")
        .send({})
        .expect(400);

      expect(response.body).toEqual({ error: "Name is required" });
      expect(mockDb.updateById).not.toHaveBeenCalled();
    });

    it("should return 400 when name is empty string", async () => {
      const response = await request(app)
        .put("/categories/1")
        .send({ name: "" })
        .expect(400);

      expect(response.body).toEqual({ error: "Name is required" });
      expect(mockDb.updateById).not.toHaveBeenCalled();
    });

    it("should return 400 when name is only whitespace", async () => {
      const response = await request(app)
        .put("/categories/1")
        .send({ name: "   " })
        .expect(400);

      expect(response.body).toEqual({ error: "Name is required" });
      expect(mockDb.updateById).not.toHaveBeenCalled();
    });

    it("should return 400 when name is not a string", async () => {
      const response = await request(app)
        .put("/categories/1")
        .send({ name: 123 })
        .expect(400);

      expect(response.body).toEqual({ error: "Name is required" });
      expect(mockDb.updateById).not.toHaveBeenCalled();
    });

    it("should return 500 when database operation fails", async () => {
      // Mock console.error to suppress expected error logs during testing
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      mockDb.updateById.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .put("/categories/1")
        .send({ name: "Test Category" })
        .expect(500);

      expect(response.body).toEqual({ error: "Internal server error" });

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
