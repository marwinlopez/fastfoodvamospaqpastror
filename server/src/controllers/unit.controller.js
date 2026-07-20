const unitService = require("../services/unit.service");
const asyncHandler = require("../utils/asyncHandler");

exports.getAll = asyncHandler(async (req, res) => {
  const units = await unitService.getAllUnits();
  res.json({ success: true, unitOf: units });
});

exports.create = asyncHandler(async (req, res) => {
  const unit = await unitService.createUnit(req.body);
  res.json({ success: true, unit });
});

exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await unitService.updateUnit(id, req.body);
  res.status(202).json({ success: true, unit: updated });
});

exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await unitService.deleteUnit(id);
  res.json({ success: true, message: "Unidad de medida eliminada correctamente" });
});
