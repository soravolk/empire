jest.mock("passport", () => ({
  __esModule: true,
  default: {
    serializeUser: jest.fn(),
    deserializeUser: jest.fn(),
    use: jest.fn(),
  },
}));

let verifyCallback: Function = () => {};
let strategyOptions: any;

jest.mock("passport-google-oauth20", () => ({
  Strategy: jest.fn().mockImplementation((options, verify) => {
    strategyOptions = options;
    verifyCallback = verify;
    return { name: "google-strategy" };
  }),
}));

describe("services/auth (Google OAuth Strategy registration)", () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    process.env = {
      ...ORIGINAL_ENV,
      GOOGLE_CLIENT_ID: "client-id",
      GOOGLE_CLIENT_SECRET: "client-secret",
      FRONTEND_URL: "https://frontend.example.com",
    };

    require("../../services/auth");
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("registers serializeUser/deserializeUser handlers", async () => {
    const passport = (await import("passport")).default as any;

    expect(passport.serializeUser).toHaveBeenCalledTimes(1);
    expect(passport.deserializeUser).toHaveBeenCalledTimes(1);
  });

  it("registers GoogleStrategy via passport.use", async () => {
    const passport = (await import("passport")).default as any;

    expect(passport.use).toHaveBeenCalledTimes(1);
    expect(passport.use).toHaveBeenCalledWith(expect.any(Object));
  });

  it("passes correct GoogleStrategy options", () => {
    expect(strategyOptions).toEqual({
      clientID: "client-id",
      clientSecret: "client-secret",
      callbackURL: "https://frontend.example.com/auth/google/callback",
    });
  });

  it("verify callback maps profile to user object (id/email/name)", async () => {
    const done = jest.fn();

    await verifyCallback(
      "access",
      "refresh",
      {
        id: "benson",
        emails: [{ value: "benson@test.com" }],
        displayName: "Benson Test",
      },
      done
    );

    expect(done).toHaveBeenCalledWith(null, {
      id: "benson",
      email: "benson@test.com",
      name: "Benson Test",
    });
  });

  it("verify callback handles missing emails gracefully", async () => {
    const done = jest.fn();

    await verifyCallback(
      "access",
      "refresh",
      {
        id: "u1",
        emails: undefined,
        displayName: "No Email",
      },
      done
    );

    expect(done).toHaveBeenCalledWith(null, {
      id: "u1",
      email: undefined,
      name: "No Email",
    });
  });
});
