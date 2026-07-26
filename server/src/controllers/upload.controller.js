const uploadService = require("../services/upload.service");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../errors/app-error");

exports.uploadImage = asyncHandler(async (req, res) => {
  const { image, filename } = req.body;
  if (!image) {
    throw new AppError("Falta la imagen", 400, "MISSING_IMAGE");
  }
  const url = await uploadService.uploadBase64Image(image, filename);
  res.json({ success: true, url });
});
