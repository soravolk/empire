import passport from "passport";
import user from "../../controllers/user";

jest.mock("../../controllers/user");
jest.mock("passport");

// --- Mock GoogleStrategy to capture verify callback ---
let verifyCallback: Function = () => {};

jest.mock("passport-google-oauth20", () => {
  return {
    Strategy: jest.fn().mockImplementation((options, verify) => {
      verifyCallback = verify; // store verify callback
      return {}; // strategy instance (unused)
    }),
  };
});

describe("auth Google OAuth Strategy", () => {
  beforeAll(() => {
    // Load auth.ts to register the strategy
    require("../../services/auth");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should login existing user", async () => {
    (user.getUserById as jest.Mock).mockResolvedValue({
      id: "benson",
      email: "benson@test.com",
    });

    const done = jest.fn();

    await verifyCallback(
      "token",
      "refresh",
      {
        id: "benson",
        emails: [{ value: "benson@test.com" }],
        displayName: "TEST USER",
      },
      done
    );

    expect(user.getUserById).toHaveBeenCalledWith("benson"); // ★ 修正這裡
    expect(done).toHaveBeenCalledWith(null, {
      id: "benson",
      email: "benson@test.com",
    });
  });

  it("should create a new user if not exists", async () => {
    (user.getUserById as jest.Mock)
      .mockResolvedValueOnce(null) // first lookup → not found
      .mockResolvedValueOnce({ id: "volk", email: "volk@test.com" }); // after create

    (user.createUser as jest.Mock).mockResolvedValue(undefined);

    const done = jest.fn();

    await verifyCallback(
      "token",
      "refresh",
      {
        id: "volk",                               // ★ 改成 volk
        emails: [{ value: "volk@test.com" }],
        displayName: "New Person",
      },
      done
    );

    expect(user.createUser).toHaveBeenCalledWith(
      "volk",
      "volk@test.com",
      "New Person"
    );

    expect(done).toHaveBeenCalledWith(null, {
      id: "volk",
      email: "volk@test.com",
    });
  });

  it("should return error when getUserById throws", async () => {
    (user.getUserById as jest.Mock).mockRejectedValue(new Error("fail"));

    const done = jest.fn();

    await verifyCallback("t", "r", { id: "ernir" }, done);

    expect(done).toHaveBeenCalledWith(
      new Error("failed to get user information"),
      undefined
    );
  });

  it("should return error when createUser throws", async () => {
    (user.getUserById as jest.Mock)
      .mockResolvedValueOnce(null); // not found

    (user.createUser as jest.Mock).mockRejectedValue(new Error("fail"));

    const done = jest.fn();

    await verifyCallback(
      "token",
      "refresh",
      {
        id: "ernir",
        emails: [{ value: "ernir@test.com" }],
        displayName: "TEST",
      },
      done
    );

    expect(done).toHaveBeenCalledWith(
      new Error("failed to create a new user"),
      undefined
    );
  });
});
