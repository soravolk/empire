const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    ["/auth/google", "/auth/logout"],
    createProxyMiddleware({
      target: "http://localhost:5001",
      changeOrigin: false,
    })
  );
};
