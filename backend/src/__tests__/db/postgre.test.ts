import { Pool } from "pg";
import { getDatabaseSecret } from "../../db/getSecret";
import { init, pg } from "../../db/postgre";

jest.mock("pg", () => {
  const Pool = jest.fn();
  return { Pool };
});

jest.mock("../../db/getSecret", () => ({
  getDatabaseSecret: jest.fn(),
}));

const MockedPool = Pool as unknown as jest.Mock;
const mockGetDatabaseSecret =
  getDatabaseSecret as unknown as jest.MockedFunction<typeof getDatabaseSecret>;

const ORIGINAL_ENV = { ...process.env };

describe("db/postgre → init", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    process.env.PG_USER = "test-user";
    process.env.PG_HOST = "localhost";
    process.env.PG_DATABASE = "test-db";
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("initializes Pool without secret in non-production environments", async () => {
    process.env.NODE_ENV = "test";
    const poolInstance = {};
    MockedPool.mockReturnValueOnce(poolInstance as any);

    await init();

    expect(mockGetDatabaseSecret).not.toHaveBeenCalled();
    expect(MockedPool).toHaveBeenCalledTimes(1);
    expect(MockedPool).toHaveBeenCalledWith({
      user: "test-user",
      host: "localhost",
      database: "test-db",
      port: 5432,
      password: undefined,
      ssl: undefined,
    });
    expect(pg).toBe(poolInstance);
  });

  it("initializes Pool with secret and SSL config in production", async () => {
    process.env.NODE_ENV = "production";

    mockGetDatabaseSecret.mockResolvedValueOnce("super-secret");
    const poolInstance = {};
    MockedPool.mockReturnValueOnce(poolInstance as any);

    await init();

    expect(mockGetDatabaseSecret).toHaveBeenCalledTimes(1);
    expect(MockedPool).toHaveBeenCalledTimes(1);
    expect(MockedPool).toHaveBeenCalledWith({
      user: "test-user",
      host: "localhost",
      database: "test-db",
      port: 5432,
      password: "super-secret",
      ssl: { rejectUnauthorized: false },
    });
    expect(pg).toBe(poolInstance);
  });

  it("throws when secret is undefined in production", async () => {
    process.env.NODE_ENV = "production";

    mockGetDatabaseSecret.mockResolvedValueOnce(undefined as any);

    await expect(init()).rejects.toThrow("RDS secret is undefined");
    expect(MockedPool).not.toHaveBeenCalled();
  });

  it("throws when secret is not a string in production", async () => {
    process.env.NODE_ENV = "production";

    mockGetDatabaseSecret.mockResolvedValueOnce({ foo: "bar" } as any);

    await expect(init()).rejects.toThrow("RDS secret is not string");
    expect(MockedPool).not.toHaveBeenCalled();
  });
});
