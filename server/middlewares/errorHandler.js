const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const key = Object.keys(err.keyValue).join(", ");
    message = `Duplicate field value entered for key: ${key}`;
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    message = Object.values(err.errors).map((val) => val.message).join(", ");
  }

  console.error(`[ERROR] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} | Code: ${statusCode} | ${message}`);
  if (err.stack && process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;
