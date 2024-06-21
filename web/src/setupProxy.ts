import { Application } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

module.exports = function (app: Application) {
  app.use(
    "/auth/google",
    createProxyMiddleware({
      target: "http://localhost:5000/auth/google",
      changeOrigin: false,
    })
  );
};
