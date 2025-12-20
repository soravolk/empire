import serverlessExpress from "@codegenie/serverless-express";
import { Handler } from "aws-lambda";
import { createAuthApp } from "./auth-app";

let serverlessExpressInstance: Handler;

async function setup() {
  const app = await createAuthApp();
  serverlessExpressInstance = serverlessExpress({ app });
}

export const handler: Handler = async (event, context, callback) => {
  if (!serverlessExpressInstance) {
    await setup();
  }
  return serverlessExpressInstance(event, context, callback);
};
