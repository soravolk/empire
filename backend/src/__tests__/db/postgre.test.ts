describe("db/postgre → init", () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };

    process.env.PG_USER = "test-user";
    process.env.PG_HOST = "localhost";
    process.env.PG_DATABASE = "test-db";
    process.env.PG_PORT = "5432";
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("creates a Pool in non-production without requiring PG_PASSWORD", async () => {
    process.env.NODE_ENV = "test";
    delete process.env.PG_PASSWORD;

    const poolInstance = { query: jest.fn() };

    jest.doMock("pg", () => ({
      Pool: jest.fn().mockImplementation(() => poolInstance),
    }));

    const postgre = await import("../../db/postgre");
    const { Pool } = await import("pg");
    const MockedPool = Pool as unknown as jest.Mock;

    const result = await postgre.init();

    expect(result).toBe(poolInstance);
    expect(postgre.pg).toBe(poolInstance);

    expect(MockedPool).toHaveBeenCalledTimes(1);
    expect(MockedPool).toHaveBeenCalledWith({
      user: "test-user",
      host: "localhost",
      database: "test-db",
      port: 5432,
      password: undefined,
      ssl: undefined,
    });
  });

  it("creates a Pool in production and requires PG_PASSWORD + sets ssl", async () => {
    process.env.NODE_ENV = "production";
    process.env.PG_PASSWORD = "super-secret";

    const poolInstance = { query: jest.fn() };

    jest.doMock("pg", () => ({
      Pool: jest.fn().mockImplementation(() => poolInstance),
    }));

    const postgre = await import("../../db/postgre");
    const { Pool } = await import("pg");
    const MockedPool = Pool as unknown as jest.Mock;

    const result = await postgre.init();

    expect(result).toBe(poolInstance);
    expect(postgre.pg).toBe(poolInstance);

    expect(MockedPool).toHaveBeenCalledTimes(1);
    expect(MockedPool).toHaveBeenCalledWith({
      user: "test-user",
      host: "localhost",
      database: "test-db",
      port: 5432,
      password: "super-secret",
      ssl: { rejectUnauthorized: false },
    });
  });

  it("returns existing pg (does not create Pool twice)", async () => {
    process.env.NODE_ENV = "test";
    delete process.env.PG_PASSWORD;

    const poolInstance = { query: jest.fn() };

    jest.doMock("pg", () => ({
      Pool: jest.fn().mockImplementation(() => poolInstance),
    }));

    const postgre = await import("../../db/postgre");
    const { Pool } = await import("pg");
    const MockedPool = Pool as unknown as jest.Mock;

    const first = await postgre.init();
    const second = await postgre.init();

    expect(first).toBe(poolInstance);
    expect(second).toBe(poolInstance);
    expect(MockedPool).toHaveBeenCalledTimes(1);
  });

  it("throws when required env vars are missing (non-production)", async () => {
    process.env.NODE_ENV = "test";
    delete process.env.PG_HOST;

    jest.doMock("pg", () => ({ Pool: jest.fn() }));

    const postgre = await import("../../db/postgre");

    await expect(postgre.init()).rejects.toThrow(
      "Missing required DB env vars (PG_HOST, PG_USER, PG_PASSWORD, PG_DATABASE)"
    );
  });

  it("throws in production when PG_PASSWORD is missing", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.PG_PASSWORD;

    jest.doMock("pg", () => ({ Pool: jest.fn() }));

    const postgre = await import("../../db/postgre");

    await expect(postgre.init()).rejects.toThrow(
      "Missing required DB env vars (PG_HOST, PG_USER, PG_PASSWORD, PG_DATABASE)"
    );
  });
});
