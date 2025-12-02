import controller from "../../controllers/user";
import db from "../../db/utils";

describe("controllers/user", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createUser", () => {
    it("calls db.insert with correct args", async () => {
      const insertSpy = jest
        .spyOn(db, "insert")
        .mockResolvedValueOnce(undefined as any);

      await controller.createUser("123", "test@example.com", "Benson");

      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy).toHaveBeenCalledWith("users", {
        id: "123",
        email: "test@example.com",
        display_name: "Benson",
      });
    });

    it("throws wrapped error when db fails", async () => {
      jest
        .spyOn(db, "insert")
        .mockRejectedValueOnce(new Error("db is down"));

      await expect(
        controller.createUser("123", "test@example.com", "Benson"),
      ).rejects.toThrow("failed to create a new user");
    });
  });

  describe("getUserById", () => {
    it("calls db.getById with correct args and returns first row", async () => {
      const fakeUser = {
        id: "u1",
        email: "u1@example.com",
        display_name: "User 1",
      };

      const getByIdSpy = jest
        .spyOn(db, "getById")
        .mockResolvedValueOnce({ rows: [fakeUser] } as any);

      const result = await controller.getUserById("u1");

      expect(getByIdSpy).toHaveBeenCalledTimes(1);
      expect(getByIdSpy).toHaveBeenCalledWith("users", "u1", "u1");
      expect(result).toEqual(fakeUser);
    });

    it("throws wrapped error when db.getById fails", async () => {
      jest
        .spyOn(db, "getById")
        .mockRejectedValueOnce(new Error("db err"));

      await expect(controller.getUserById("no-such-id")).rejects.toThrow(
        "failed to get an user from the specified ID",
      );
    });
  });
});