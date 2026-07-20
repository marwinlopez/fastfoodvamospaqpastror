const AppError = require("../errors/app-error");

const handleFirebaseError = (err) => {
  switch (err.code) {
    case "permission-denied":
      return new AppError("No tienes permisos suficientes para realizar esta acción.", 403, "FORBIDDEN");
    case "not-found":
      return new AppError("El recurso solicitado no fue encontrado en la base de datos.", 404, "NOT_FOUND");
    case "already-exists":
      return new AppError("El recurso que intentas crear ya existe.", 409, "ALREADY_EXISTS");
    case "resource-exhausted":
      return new AppError("Límite de solicitudes excedido. Intenta más tarde.", 429, "QUOTA_EXCEDED");
    // Firebase Authentication Errors
    case "auth/user-not-found":
      return new AppError("El usuario especificado no existe.", 404, "USER_NOT_FOUND");
    case "auth/email-already-exists":
      return new AppError("La dirección de correo ya se encuentra registrada.", 409, "EMAIL_ALREADY_EXISTS");
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return new AppError("Credenciales de acceso inválidas.", 401, "UNAUTHORIZED");
    case "auth/id-token-expired":
      return new AppError("La sesión ha expirado. Por favor, inicia sesión de nuevo.", 401, "TOKEN_EXPIRED");
    default:
      if (err.code && typeof err.code === 'string' && err.code.startsWith('auth/')) {
        return new AppError(`Error de autenticación: ${err.message}`, 400, "AUTH_ERROR");
      }
      return null;
  }
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.code = err.code;

  const firebaseMappedError = handleFirebaseError(err);
  if (firebaseMappedError) {
    error = firebaseMappedError;
  }

  const statusCode = error.statusCode || 500;
  const status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
  const isProd = process.env.NODE_ENV === "production";

  // Imprimir stack trace para errores internos que no son operacionales
  if (statusCode === 500 || !error.isOperational) {
    console.error("ERROR 💥:", err);
  }

  res.status(statusCode).json({
    status,
    code: error.code || "INTERNAL_ERROR",
    message: error.message || "Algo salió mal en el servidor.",
    ...(isProd ? {} : { stack: err.stack })
  });
};

module.exports = errorHandler;
