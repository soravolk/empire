import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export const getDatabaseSecret = async () => {
  const client = new SecretsManagerClient({
    region: "eu-west-1",
  });

  let response;

  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: process.env.PG_SECRET_NAME,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      })
    );
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
  }

  if (response.SecretString === undefined) {
    throw new Error("failed to fetch SecretString");
  }

  const secret = JSON.parse(response.SecretString);

  return secret.password;
};
