const roleService = require("../services/role.service");
const asyncHandler = require("../utils/asyncHandler");

exports.getAll = asyncHandler(async (req, res) => {
  const roles = await roleService.getAllRoles();
  res.json({ success: true, roles });
});

exports.create = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(req.body);
  res.json({ success: true, role });
});

exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await roleService.updateRole(id, req.body);
  res.status(202).json({ success: true, role: updated });
});

exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await roleService.deleteRole(id);
  res.json({ success: true, message: "Rol eliminado correctamente" });
});
