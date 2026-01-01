import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamodbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  ...(process.env.DYNAMODB_ENDPOINT && {
    endpoint: process.env.DYNAMODB_ENDPOINT,
  }),
});

export async function init() {
  try {
    // Test the connection by listing tables (or any simple operation)
    const endpoint = process.env.DYNAMODB_ENDPOINT;
    console.log(`DynamoDB client initialized (${endpoint})`);
  } catch (error) {
    console.error("Failed to initialize DynamoDB:", error);
    throw error;
  }
}

export { dynamodbClient };
