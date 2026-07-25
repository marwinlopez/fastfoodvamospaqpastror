const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const staffRepository = require("../repositories/staff.repository");
const roleRepository = require("../repositories/role.repository");
const AppError = require("../errors/app-error");

const stripPassword = (record) => {
  if (!record) return record;
  const { passwordHash, ...safe } = record;
  return safe;
};

// Adjunta los permisos del rol asignado al staff. Si no tiene rol (roleId
// nulo) o el rol ya no existe, se omite `permissions` — el cliente trata la
// ausencia de este campo como "sin restricción" para no romper cuentas
// creadas antes de que existiera este sistema de permisos.
const attachPermissions = async (staff) => {
  if (!staff?.roleId) return staff;
  const role = await roleRepository.getById(staff.roleId);
  if (!role) return staff;
  return { ...staff, permissions: role.permissions || [] };
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
      { staffId: staff.id, roleId: staff.roleId, companyId: staff.companyId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    const staffWithPermissions = await attachPermissions(stripPassword(staff));
    return { token, staff: staffWithPermissions };
  }

  async getCurrentStaff(staffId) {
    const staff = await staffRepository.getById(staffId);
    if (!staff) {
      throw new AppError("El usuario ya no existe", 404, "NOT_FOUND");
    }
    return await attachPermissions(stripPassword(staff));
  }
}

module.exports = new AuthService();
