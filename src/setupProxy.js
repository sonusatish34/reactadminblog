const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api-proxy",
    createProxyMiddleware({
      target: "https://dev.longdrivecars.com",
      changeOrigin: true,
      pathRewrite: {
        "^/api-proxy": "",
      },
      secure: false, // Ensures SSL/HTTPS handshake passes smoothly
    })
  );
};