const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/l-s3-dc',
    createProxyMiddleware({
      target: 'https://dev.longdrivecars.com',
      changeOrigin: true,
      secure: false,
    })
  );
};