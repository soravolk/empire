import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export type DbSecret = {
  host?: string;
  port?: number | string;
  username?: string;
  user?: string;
  password?: string;
  dbname?: string;
  database?: string;
  ssl?: boolean | object;
};

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
  const region =
    process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "eu-west-1";
  const client = new SecretsManagerClient({ region });

  const pgSecretId = process.env.PG_SECRET_NAME;
  const appSecretId = process.env.SECRET_NAME; // may contain host/port/user/database in your setup
  if (!pgSecretId) throw new Error("PG_SECRET_NAME is not set");

  try {
    console.log("Fetching DB-related secrets from Secrets Manager ...");

    // Fetch PG secret (typically contains password, may also have connection fields if using RDS managed secret)
    const pgResp = await client.send(
      new GetSecretValueCommand({
        SecretId: pgSecretId,
        VersionStage: "AWSCURRENT",
      })
    );
    if (!pgResp.SecretString)
      throw new Error(`Secret ${pgSecretId} has no SecretString`);
    const pgSec = JSON.parse(pgResp.SecretString) as DbSecret;

    // Optionally fetch app secret for connection metadata (host/port/user/database)
    let appSec: DbSecret = {};
    if (appSecretId) {
      try {
        const appResp = await client.send(
          new GetSecretValueCommand({
            SecretId: appSecretId,
            VersionStage: "AWSCURRENT",
          })
        );
        if (appResp.SecretString)
          appSec = JSON.parse(appResp.SecretString) as DbSecret;
      } catch (e) {
        console.warn(
          `Warning: failed to read app secret ${appSecretId} for DB config:`,
          e
        );
      }
    }

    // Prefer values from app secret, then fallback to PG secret, then sensible defaults
    const a = appSec as Record<string, any>;
    const p = pgSec as Record<string, any>;
    const host = a.PG_HOST || a.DB_HOST || appSec.host || pgSec.host;
    const portValue =
      a.PG_PORT || a.DB_PORT || appSec.port || pgSec.port || 5432;
    const user =
      a.PG_USER ||
      a.DB_USER ||
      appSec.user ||
      appSec.username ||
      pgSec.user ||
      pgSec.username;
    const database =
      a.PG_DATABASE ||
      a.DB_NAME ||
      appSec.database ||
      appSec.dbname ||
      pgSec.database ||
      pgSec.dbname;
    const password =
      pgSec.password ||
      a.PG_PASSWORD ||
      a.DB_PASSWORD ||
      (appSec as any).password;

    const port = Number(portValue);

    if (!host || ["127.0.0.1", "localhost"].includes(String(host))) {
      throw new Error(
        `Invalid DB host "${host}". Check ${
          appSecretId ?? "app secret"
        } or ${pgSecretId} contents.`
      );
    }
    if (!user || !password || !database) {
      throw new Error(
        `Incomplete DB config. Ensure user/username, password, and database/dbname exist in ${
          appSecretId ?? "app secret"
        } and/or ${pgSecretId}.`
      );
    }

    return {
      host: String(host),
      port,
      user: String(user),
      password: String(password),
      database: String(database),
    };
  } catch (error) {
    console.error("Error fetching secret:", error);
    throw error;
  }
};
