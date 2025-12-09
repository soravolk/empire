// src/__tests__/db/getSecret.test.ts
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { getDatabaseSecret } from "../../db/getSecret";

const sendMock = jest.fn();

jest.mock("@aws-sdk/client-secrets-manager", () => {
  return {
    SecretsManagerClient: jest.fn().mockImplementation(() => ({
      send: sendMock,
    })),
    GetSecretValueCommand: jest.fn(),
  };
});

const SecretsManagerClientMock =
  SecretsManagerClient as unknown as jest.MockedClass<
    typeof SecretsManagerClient
  >;
const GetSecretValueCommandMock =
  GetSecretValueCommand as unknown as jest.Mock<typeof GetSecretValueCommand>;

const ORIGINAL_ENV = { ...process.env };

describe("db/getSecret → getDatabaseSecret", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sendMock.mockReset();
    process.env = { ...ORIGINAL_ENV };
    process.env.PG_SECRET_NAME = "my-secret-name";
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("should return password when SecretString is present", async () => {
    const secretObject = { password: "super-secret-password" };

    sendMock.mockResolvedValueOnce({
      SecretString: JSON.stringify(secretObject),
    });

    const result = await getDatabaseSecret();

    expect(result).toBe("super-secret-password");

    expect(SecretsManagerClientMock).toHaveBeenCalledWith({
      region: "eu-west-1",
    });

    expect(GetSecretValueCommandMock).toHaveBeenCalledWith({
      SecretId: "my-secret-name",
      VersionStage: "AWSCURRENT",
    });

    expect(sendMock).toHaveBeenCalledTimes(1);
    const sendArg = sendMock.mock.calls[0][0];
    expect(sendArg).toBeInstanceOf(GetSecretValueCommand);
  });

  it("should rethrow errors from Secrets Manager client", async () => {
    const awsError = new Error("aws error");
    sendMock.mockRejectedValueOnce(awsError);

    await expect(getDatabaseSecret()).rejects.toThrow("aws error");
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("should throw when SecretString is undefined", async () => {
    sendMock.mockResolvedValueOnce({
      SecretString: undefined,
    });

    await expect(getDatabaseSecret()).rejects.toThrow(
      "failed to fetch SecretString"
    );
  });

  it("should propagate JSON parse error when SecretString is invalid JSON", async () => {
    sendMock.mockResolvedValueOnce({
      SecretString: "this-is-not-json",
    });

    await expect(getDatabaseSecret()).rejects.toThrow(SyntaxError);
  });
});
