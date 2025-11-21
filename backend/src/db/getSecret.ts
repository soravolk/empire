import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: any;
};

// Fetch and return the full DB secret object (host, port, user, password, database)
export const getDatabaseSecret = async (): Promise<DbConfig> => {
  const region = process.env.AWS_REGION;
  const client = new SecretsManagerClient({ region });

  const pgSecretId = process.env.PG_SECRET_NAME;
  const appSecretId = process.env.SECRET_NAME;
  if (!pgSecretId) throw new Error("PG_SECRET_NAME is not set");
  if (!appSecretId) throw new Error("SECRET_NAME is not set");

  try {
    console.log("Fetching DB-related secrets from Secrets Manager ...");

    // Fetch PG secret for RDS connection
    const pgResp = await client.send(
      new GetSecretValueCommand({
        SecretId: pgSecretId,
        VersionStage: "AWSCURRENT",
      })
    );
    if (!pgResp.SecretString)
      throw new Error(`Secret ${pgSecretId} has no SecretString`);
    const pgSec = JSON.parse(pgResp.SecretString);

    // Fetch app secret for connection metadata (host/port/user/database)
    const appResp = await client.send(
      new GetSecretValueCommand({
        SecretId: appSecretId,
        VersionStage: "AWSCURRENT",
      })
    );
    if (!appResp.SecretString)
      throw new Error(
        `Failed to read app secret ${appSecretId} for DB config:`
      );
    const appSec = JSON.parse(appResp.SecretString);

    // Prefer values from app secret, then fallback to PG secret, then sensible defaults
    const host = appSec.DB_HOST;
    const port = appSec.DB_PORT;
    const user = appSec.DB_USER;
    const database = appSec.DB_NAME;
    const password = pgSec.password;

    if (!host || !port || !user || !database || !password) {
      throw new Error(
        "Incomplete DB config. Ensure user/username, password, and database/dbname exist in secret"
      );
    }

    return {
      host: String(host),
      port: Number(port),
      user: String(user),
      password: String(password),
      database: String(database),
    };
  } catch (error) {
    console.error("Error fetching secret:", error);
    throw error;
  }
};
