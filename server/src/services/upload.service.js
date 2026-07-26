const { put } = require("@vercel/blob");
const AppError = require("../errors/app-error");

const DATA_URI_PATTERN = /^data:(image\/\w+);base64,(.+)$/;

class UploadService {
  async uploadBase64Image(dataUri, filename) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new AppError(
        "El almacenamiento de imágenes no está configurado (falta BLOB_READ_WRITE_TOKEN)",
        500,
        "BLOB_NOT_CONFIGURED"
      );
    }

    const match = DATA_URI_PATTERN.exec(dataUri || "");
    if (!match) {
      throw new AppError("Formato de imagen inválido", 400, "INVALID_IMAGE");
    }
    const [, mimeType, base64Data] = match;
    const buffer = Buffer.from(base64Data, "base64");
    const ext = mimeType.split("/")[1] || "jpg";
    const safeName = (filename || "imagen").replace(/[^a-zA-Z0-9-_]/g, "_");
    const key = `menu/${safeName}-${Date.now()}.${ext}`;

    const blob = await put(key, buffer, {
      access: "public",
      contentType: mimeType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return blob.url;
  }
}

module.exports = new UploadService();
