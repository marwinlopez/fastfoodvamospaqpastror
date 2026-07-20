const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const staffRepository = require("../repositories/staff.repository");
const AppError = require("../errors/app-error");

const stripPassword = (record) => {
  if (!record) return record;
  const { passwordHash, ...safe } = record;
  return safe;
};

class AuthService {
  async login(email, password) {
    const staff = await staffRepository.findByEmail(email);

    if (!staff || !staff.passwordHash) {
      throw new AppError("Credenciales inválidas", 401, "INVALID_CREDENTIALS");
    }

    const valid = await bcrypt.compare(password, staff.passwordHash);
    if (!valid) {
      throw new AppError("Credenciales inválidas", 401, "INVALID_CREDENTIALS");
    }

    if (staff.isActive === false) {
      throw new AppError("Cuenta desactivada", 403, "ACCOUNT_DISABLED");
    }

    const token = jwt.sign(
      { staffId: staff.id, roleId: staff.roleId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return { token, staff: stripPassword(staff) };
  }

  async getCurrentStaff(staffId) {
    const staff = await staffRepository.getById(staffId);
    if (!staff) {
      throw new AppError("El usuario ya no existe", 404, "NOT_FOUND");
    }
    return stripPassword(staff);
  }
}

module.exports = new AuthService();
