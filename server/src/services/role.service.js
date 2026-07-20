const roleRepository = require("../repositories/role.repository");

class RoleService {
  async getAllRoles() {
    let roles = await roleRepository.getAll();
    if (roles.length === 0) {
      const defaultRoles = [
        {
          name: "Administrador",
          permissions: [
            "view_menu",
            "edit_menu",
            "manage_staff",
            "manage_roles",
            "view_inventory",
            "manage_inventory",
          ],
        },
        {
          name: "Cocinero",
          permissions: ["view_menu", "view_inventory"],
        },
        {
          name: "Cajero",
          permissions: ["view_menu", "create_orders"],
        },
      ];
      roles = await roleRepository.createBatch(defaultRoles);
    }
    return roles;
  }

  async createRole(data) {
    return await roleRepository.create({
      name: data.name,
      permissions: data.permissions || [],
    });
  }

  async updateRole(id, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.permissions !== undefined) updateData.permissions = data.permissions;
    return await roleRepository.update(id, updateData);
  }

  async deleteRole(id) {
    return await roleRepository.delete(id);
  }
}

module.exports = new RoleService();
