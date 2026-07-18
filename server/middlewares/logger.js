const logger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    console.log(`[HTTP] ${new Date().toISOString()} | ${method} ${originalUrl} | Status: ${statusCode} | Time: ${duration}ms`);
  });
  next();
};

export default logger;
