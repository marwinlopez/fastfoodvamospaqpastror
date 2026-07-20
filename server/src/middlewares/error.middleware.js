const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
  const isProd = process.env.NODE_ENV === "production";

  // Imprimir stack trace para errores internos que no son operacionales
  if (statusCode === 500 || !err.isOperational) {
    console.error("ERROR 💥:", err);
  }

  res.status(statusCode).json({
    status,
    code: err.code || "INTERNAL_ERROR",
    message: err.message || "Algo salió mal en el servidor.",
    ...(isProd ? {} : { stack: err.stack })
  });
};

module.exports = errorHandler;
