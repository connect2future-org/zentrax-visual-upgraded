const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

if (!cloudinary.isConfigured) {
  const unavailable = (_req, res) => res.status(503).json({
    success: false,
    message: "Image uploads are unavailable because Cloudinary is not configured on this server.",
  });
  module.exports = {
    fields: () => unavailable,
    array: () => unavailable,
    single: () => unavailable,
  };
} else {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "zentrax-projects",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
  });

  const upload = multer({ storage });

  module.exports = upload;
}
