const staffRepository = require("../repositories/staff.repository");

class StaffService {
  async getAllStaff() {
    return await staffRepository.getAll();
  }

  async createStaff(data) {
    return await staffRepository.create({
      name: data.name,
      email: data.email || "",
      phone: data.phone || "",
      roleId: data.roleId || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
  }

  async updateStaff(id, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.roleId !== undefined) updateData.roleId = data.roleId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return await staffRepository.update(id, updateData);
  }

  async deleteStaff(id) {
    return await staffRepository.delete(id);
  }
}

module.exports = new StaffService();
