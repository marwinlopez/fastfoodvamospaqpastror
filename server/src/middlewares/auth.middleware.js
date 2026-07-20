const jwt = require("jsonwebtoken");
const staffRepository = require("../repositories/staff.repository");
const AppError = require("../errors/app-error");

const stripPassword = (record) => {
  if (!record) return record;
  const { passwordHash, ...safe } = record;
  return safe;
};

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError("No autorizado", 401, "UNAUTHORIZED");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new AppError("Sesión inválida o expirada", 401, "UNAUTHORIZED");
    }

    const staff = await staffRepository.getById(decoded.staffId);
    if (!staff) {
      throw new AppError("No autorizado", 401, "UNAUTHORIZED");
    }
    if (staff.isActive === false) {
      throw new AppError("Cuenta desactivada", 403, "ACCOUNT_DISABLED");
    }

    req.staff = stripPassword(staff);
    next();
  } catch (err) {
    next(err);
  }
};
