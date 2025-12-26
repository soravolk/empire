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
