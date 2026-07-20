const bcrypt = require("bcryptjs");
const staffRepository = require("../repositories/staff.repository");
const AppError = require("../errors/app-error");

const stripPassword = (record) => {
  if (!record) return record;
  const { passwordHash, ...safe } = record;
  return safe;
};

class StaffService {
  async getAllStaff() {
    const staff = await staffRepository.getAll();
    return staff.map(stripPassword);
  }

  async createStaff(data) {
    if (!data.password) {
      throw new AppError("Se requiere una contraseña para crear un miembro del personal", 400, "PASSWORD_REQUIRED");
    }
    if (!data.email) {
      throw new AppError("Se requiere un correo para asignar una contraseña", 400, "EMAIL_REQUIRED_FOR_LOGIN");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const created = await staffRepository.create({
      name: data.name,
      email: data.email || "",
      phone: data.phone || "",
      roleId: data.roleId || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      passwordHash,
    });
    return stripPassword(created);
  }

  async updateStaff(id, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.roleId !== undefined) updateData.roleId = data.roleId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.password) {
      const existing = await staffRepository.getById(id);
      const finalEmail = data.email !== undefined ? data.email : existing?.email;
      if (!finalEmail) {
        throw new AppError("Se requiere un correo para asignar una contraseña", 400, "EMAIL_REQUIRED_FOR_LOGIN");
      }
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updated = await staffRepository.update(id, updateData);
    return stripPassword(updated);
  }

  async deleteStaff(id) {
    return await staffRepository.delete(id);
  }
}

module.exports = new StaffService();
