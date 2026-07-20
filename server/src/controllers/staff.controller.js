const staffService = require("../services/staff.service");
const asyncHandler = require("../utils/asyncHandler");

exports.getAll = asyncHandler(async (req, res) => {
  const staff = await staffService.getAllStaff();
  res.json({ success: true, staff });
});

exports.create = asyncHandler(async (req, res) => {
  const staffMember = await staffService.createStaff(req.body);
  res.json({ success: true, staff: staffMember });
});

exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await staffService.updateStaff(id, req.body);
  res.status(202).json({ success: true, staff: updated });
});

exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await staffService.deleteStaff(id);
  res.json({ success: true, message: "Miembro del personal eliminado correctamente" });
});
