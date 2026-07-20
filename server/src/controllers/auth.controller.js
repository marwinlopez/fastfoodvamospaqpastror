const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../errors/app-error");

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("Correo y contraseña son requeridos", 400, "MISSING_CREDENTIALS");
  }
  const { token, staff } = await authService.login(email, password);
  res.json({ success: true, token, staff });
});

exports.me = asyncHandler(async (req, res) => {
  const staff = await authService.getCurrentStaff(req.staff.id);
  res.json({ success: true, staff });
});
