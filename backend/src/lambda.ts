// Load dotenv only when not running inside AWS Lambda
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
}

import serverlessExpress from "@codegenie/serverless-express";
import { Handler } from "aws-lambda";
import { createApp } from "./app";

let serverlessExpressInstance: Handler;

async function setup() {
  const app = await createApp();
  serverlessExpressInstance = serverlessExpress({ app });
}

export const handler: Handler = async (event, context, callback) => {
  if (!serverlessExpressInstance) {
    await setup();
  }

  return serverlessExpressInstance(event, context, callback);
};
