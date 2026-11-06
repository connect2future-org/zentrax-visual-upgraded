const { randomUUID } = require("crypto");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

if (!cloudinary.isConfigured) {
  const unavailable = (_req, res) => res.status(503).json({
    success: false,
    message: "SunShree image uploads are unavailable because Cloudinary is not configured on this server.",
  });
  module.exports = {
    fields: () => unavailable,
    array: () => unavailable,
    single: () => unavailable,
  };
} else {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: "zentrax-property-booking/sunshree",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: randomUUID(),
    }),
  });

  const propertyBookingUpload = multer({
    storage,
    limits: {
      fileSize: 8 * 1024 * 1024,
      files: 10,
    },
    fileFilter(req, file, callback) {
      if (!allowedMimeTypes.has(file.mimetype)) {
        const error = new Error("Only JPG, PNG, and WebP images are allowed");
        error.code = "INVALID_IMAGE_TYPE";
        return callback(error);
      }
      return callback(null, true);
    },
  });

  module.exports = propertyBookingUpload;
}
