const express = require("express");
const { body, validationResult } = require("express-validator");
const { requireAdminAuth } = require("../middleware/adminAuth");
const upload = require("../middleware/propertyBookingUpload");
const controller = require("../controllers/sunShreeBookingController");

const router = express.Router();
router.use(requireAdminAuth);

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map(({ path, param, msg }) => ({ field: path || param, message: msg })),
    });
  }
  return next();
};

router.get("/settings", controller.getAdminSettings);
router.put("/settings", [
  body("popup").isObject(),
  body("popup.enabled").isBoolean(),
  body("popup.qrEnabled").isBoolean(),
  body("popup.heading").isString().isLength({ max: 120 }),
  body("popup.description").isString().isLength({ max: 500 }),
  body("popup.buttonText").isString().isLength({ max: 60 }),
  body("popup.image").optional({ nullable: true }).isString().isLength({ max: 2048 }),
  body("property").isObject(),
  body("property.pageEnabled").isBoolean(),
  body("property.existingPropertyId").optional({ nullable: true, checkFalsy: true }).isMongoId(),
  body("property.name").isString().isLength({ min: 1, max: 120 }).trim(),
  body("property.category").isString().isLength({ min: 1, max: 80 }).trim(),
  body("property.description").isString().isLength({ max: 5000 }).trim(),
  body("property.address").isString().isLength({ min: 1, max: 500 }).trim(),
  body("property.image").optional({ nullable: true }).isString().isLength({ max: 2048 }),
  body("property.images").isArray({ max: 10 }),
  body("property.images.*").isString().isLength({ max: 2048 }),
  body("residentialEnquiryMessage").isString().isLength({ max: 1000 }).trim(),
  body("bookingLinks").isArray({ max: 20 }),
  body("bookingLinks.*.platformName").isString().isLength({ min: 1, max: 80 }).trim(),
  body("bookingLinks.*.bookingUrl").isString().isLength({ max: 2048 }),
  body("bookingLinks.*.isActive").isBoolean(),
  body("whatsapp").isObject(),
  body("whatsapp.number").isString().isLength({ max: 30 }),
  body("whatsapp.message").isString().isLength({ max: 1000 }).trim(),
  body("whatsapp.enabled").isBoolean(),
], validateRequest, controller.saveSettings);

router.post("/images", (req, res, next) => upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 10 },
])(req, res, (error) => {
  if (!error) return next();
  const isClientUploadError = error.code === "INVALID_IMAGE_TYPE"
    || (typeof error.code === "string" && error.code.startsWith("LIMIT_"));
  const status = isClientUploadError ? 400 : 500;
  if (status === 500) console.error("[SUNSHREE BOOKING] Image upload failed:", error.message);
  return res.status(status).json({ success: false, message: error.message || "Image upload failed" });
}), controller.uploadImage);

module.exports = router;
