const mongoose = require("mongoose");
const Property = require("../models/Property");
const SunShreeBookingSettings = require("../models/SunShreeBookingSettings");
const { isAllowedBookingUrl, isHttpsBookingUrl, normalizeIndianWhatsAppNumber } = require("../utils/sunShreeBookingValidation");

const PROPERTY_NAME_PATTERN = /^sun\s*(?:shree|sheer)(?:\s*[-–—]?\s*residential)?$/i;
const SUNSHREE_WHATSAPP_NUMBER = "919035999272";
const DEFAULT_BOOKING_LINKS = [
  {
    platformName: "Airbnb",
    bookingUrl: "https://www.airbnb.com/rooms/1794374262320072215?unique_share_id=6cafc121-b721-4aea-823c-56fdf6a54847&viralityEntryPoint=1&s=76",
    isActive: true,
  },
  {
    platformName: "Agoda",
    bookingUrl: "https://www.agoda.com/weekend-vibes-balcony-views-family-comfort/hotel/mysore-in.html",
    isActive: true,
  },
];

const ensureDefaultBookingLinks = (links = []) => {
  const configured = Array.isArray(links) ? [...links] : [];
  for (const defaultLink of DEFAULT_BOOKING_LINKS) {
    if (!configured.some((link) => link.platformName?.trim().toLowerCase() === defaultLink.platformName.toLowerCase())) {
      configured.push(defaultLink);
    }
  }
  return configured;
};

const getSettingsDefaults = () => new SunShreeBookingSettings().toObject();

const findExistingProperty = async (settings, publicOnly = false) => {
  const filter = settings?.existingPropertyId
    ? { _id: settings.existingPropertyId }
    : { name: PROPERTY_NAME_PATTERN };
  if (publicOnly) Object.assign(filter, { displayOnWebsite: true, isHidden: { $ne: true } });
  return Property.findOne(filter)
    .select("name propertyCategory propertyType description address city state country pinCode image coverImage galleryImages displayOnWebsite isHidden")
    .lean();
};

const mergeProperty = (settings, property) => ({
  name: settings.propertyName || property?.name || "SunShree",
  category: settings.propertyCategory || property?.propertyCategory || "Residential",
  description: settings.propertyDescription || property?.description || "",
  address: settings.propertyAddress || property?.address || "",
  image: settings.propertyImage || settings.propertyImages?.[0] || property?.coverImage || property?.image || "",
  images: (settings.propertyImages?.length
    ? settings.propertyImages
    : property?.galleryImages?.length
      ? property.galleryImages
      : [settings.propertyImage || property?.coverImage || property?.image || ""]
  ).filter(Boolean),
});

const getAdminSettings = async (req, res) => {
  try {
    const stored = await SunShreeBookingSettings.findOne({ settingKey: "sunshree-booking" }).lean();
    const settings = { ...getSettingsDefaults(), ...(stored || {}) };
    const [property, availableProperties] = await Promise.all([
      findExistingProperty(settings),
      Property.find({ name: PROPERTY_NAME_PATTERN, displayOnWebsite: true, isHidden: { $ne: true } })
        .select("_id name propertyCategory address displayOnWebsite isHidden image coverImage galleryImages")
        .sort({ name: 1 })
        .lean(),
    ]);
    return res.json({
      success: true,
      data: {
        ...settings,
        bookingLinks: ensureDefaultBookingLinks(settings.bookingLinks),
        whatsappNumber: SUNSHREE_WHATSAPP_NUMBER,
        residentialEnquiryMessage: settings.residentialEnquiryMessage,
        existingPropertyId: property?._id || settings.existingPropertyId || null,
        property: mergeProperty(settings, property),
        existingPropertyFound: Boolean(property),
        availableProperties,
      },
    });
  } catch (error) {
    console.error("[SUNSHREE BOOKING] Admin settings read failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load SunShree booking settings" });
  }
};

const validateSettings = (body) => {
  if (!body || typeof body !== "object" || !body.popup || !body.property || !body.whatsapp) {
    return "Complete the popup, property, and WhatsApp settings";
  }
  const { popup, property, whatsapp } = body;
  const textFields = [
    [popup.heading, 120, "Popup heading"],
    [popup.description, 500, "Popup description"],
    [popup.buttonText, 60, "Popup button text"],
    [property.name, 120, "Property name"],
    [property.category, 80, "Property category"],
    [property.description, 5000, "Property description"],
    [property.address, 500, "Property address"],
    [whatsapp.message, 1000, "WhatsApp message"],
    [body.residentialEnquiryMessage, 1000, "Residential enquiry details"],
  ];
  for (const [value, maxLength, label] of textFields) {
    if (typeof value !== "string" || value.length > maxLength) return `${label} is invalid or too long`;
  }
  for (const [value, label] of [[popup.image, "Popup image"], [property.image, "Property image"]]) {
    if (value && (!isHttpsBookingUrl(value) || new URL(value).protocol !== "https:")) {
      return `${label} must use a secure HTTPS URL`;
    }
  }
  if (typeof popup.enabled !== "boolean" || typeof popup.qrEnabled !== "boolean"
    || typeof property.pageEnabled !== "boolean" || typeof whatsapp.enabled !== "boolean") {
    return "Popup, property-page, and WhatsApp settings must be enabled or disabled";
  }
  if (popup.enabled && !property.pageEnabled) return "Enable the public SunShree page before enabling its homepage popup";
  if (property.pageEnabled && !property.existingPropertyId) return "Select an existing SunShree property before enabling its public page";
  if (property.pageEnabled && (!property.name.trim() || !property.category.trim() || !property.address.trim())) {
    return "A property name, category, and address are required before enabling the property page";
  }
  if (!Array.isArray(property.images) || property.images.length > 10
    || property.images.some((image) => image && (!isHttpsBookingUrl(image) || new URL(image).protocol !== "https:"))) {
    return "Provide at most 10 residential images, each using a secure HTTPS URL";
  }
  if (whatsapp.enabled && !normalizeIndianWhatsAppNumber(whatsapp.number)) {
    return "Enter a valid Indian WhatsApp number";
  }
  if (whatsapp.number && normalizeIndianWhatsAppNumber(whatsapp.number) !== SUNSHREE_WHATSAPP_NUMBER) {
    return "WhatsApp assistance uses the fixed SunShree number +91 9035999272";
  }
  if (!Array.isArray(body.bookingLinks) || body.bookingLinks.length > 20) return "Provide at most 20 booking links";
  for (const link of body.bookingLinks) {
    if (!link || typeof link.platformName !== "string" || !link.platformName.trim()
      || link.platformName.length > 80 || typeof link.bookingUrl !== "string"
      || !isHttpsBookingUrl(link.bookingUrl) || typeof link.isActive !== "boolean") {
      return "Each booking link requires a name, secure HTTPS URL, and enabled state";
    }
    if (!isAllowedBookingUrl(link.bookingUrl, link.platformName)) {
      return `${link.platformName} must use its official HTTPS booking domain`;
    }
  }
  return "";
};

const saveSettings = async (req, res) => {
  const validationMessage = validateSettings(req.body);
  if (validationMessage) return res.status(400).json({ success: false, message: validationMessage });

  const { popup, property, bookingLinks, whatsapp } = req.body;
  if (property.existingPropertyId && !mongoose.Types.ObjectId.isValid(property.existingPropertyId)) {
    return res.status(400).json({ success: false, message: "Invalid existing property reference" });
  }

  try {
    if (property.existingPropertyId) {
      const existingProperty = await Property.findById(property.existingPropertyId).select("name").lean();
      if (!existingProperty || !PROPERTY_NAME_PATTERN.test(existingProperty.name || "")) {
        return res.status(400).json({ success: false, message: "Select an existing SunShree property; a duplicate property will not be created" });
      }
    }
    const settings = await SunShreeBookingSettings.findOneAndUpdate(
      { settingKey: "sunshree-booking" },
      {
        $set: {
          popupEnabled: popup.enabled,
          qrPopupEnabled: true,
          popupHeading: popup.heading.trim(),
          popupDescription: popup.description.trim(),
          popupButtonText: popup.buttonText.trim(),
          popupImage: popup.image || "",
          propertyPageEnabled: property.pageEnabled,
          existingPropertyId: property.existingPropertyId || null,
          propertyName: property.name.trim(),
          propertyCategory: property.category.trim(),
          propertyDescription: property.description.trim(),
          propertyAddress: property.address.trim(),
          propertyImage: property.image || "",
          propertyImages: property.images,
          residentialEnquiryMessage: req.body.residentialEnquiryMessage.trim(),
          bookingLinks: bookingLinks.map((link) => ({
            platformName: link.platformName.trim(),
            bookingUrl: link.bookingUrl.trim(),
            isActive: link.isActive,
          })),
          whatsappNumber: SUNSHREE_WHATSAPP_NUMBER,
          whatsappMessage: whatsapp.message.trim(),
          whatsappEnabled: whatsapp.enabled,
          updatedBy: req.admin._id,
        },
        $setOnInsert: { settingKey: "sunshree-booking" },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.json({ success: true, message: "SunShree booking settings saved", data: settings });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Settings validation failed",
        errors: Object.values(error.errors).map((item) => ({ field: item.path, message: item.message })),
      });
    }
    console.error("[SUNSHREE BOOKING] Settings save failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to save SunShree booking settings" });
  }
};

const safeImageUrl = (value) => {
  try {
    return new URL(value).protocol === "https:" ? value : "";
  } catch {
    return "";
  }
};

const getPublicSettings = async (req, res) => {
  try {
    const stored = await SunShreeBookingSettings.findOne({ settingKey: "sunshree-booking" }).lean();
    const settings = { ...getSettingsDefaults(), ...(stored || {}) };
    const property = await findExistingProperty(settings, true);
    const canShowProperty = Boolean(settings.propertyPageEnabled && property);
    const propertyDetails = mergeProperty(settings, property);
    const image = safeImageUrl(settings.propertyImage) || safeImageUrl(settings.propertyImages?.[0]) || safeImageUrl(property?.coverImage) || safeImageUrl(property?.image);
    const popupImage = safeImageUrl(settings.popupImage) || image;
    const propertyImages = (settings.propertyImages?.length
      ? settings.propertyImages
      : property?.galleryImages?.length
        ? property.galleryImages
        : [image]
    ).map(safeImageUrl).filter(Boolean);
    const storedLinks = ensureDefaultBookingLinks(settings.bookingLinks);
    const publicLinks = storedLinks
      .filter((link) => link.isActive && isAllowedBookingUrl(link.bookingUrl, link.platformName))
      .map(({ platformName, bookingUrl }) => ({ platformName, bookingUrl }));

    return res.json({
      success: true,
      data: {
        popup: {
          enabled: Boolean(settings.popupEnabled && canShowProperty),
          heading: settings.popupHeading,
          description: settings.popupDescription,
          buttonText: settings.popupButtonText,
          image: popupImage,
        },
        propertyPageEnabled: canShowProperty,
        property: canShowProperty ? { ...propertyDetails, image, images: propertyImages } : null,
        bookingLinks: canShowProperty ? publicLinks : [],
        bookingLinksConfigured: Boolean(settings.bookingLinks?.length),
        residentialEnquiryMessage: settings.residentialEnquiryMessage,
        whatsapp: {
          enabled: Boolean(settings.whatsappEnabled),
          number: SUNSHREE_WHATSAPP_NUMBER,
          message: settings.whatsappMessage,
        },
      },
    });
  } catch (error) {
    console.error("[SUNSHREE BOOKING] Public settings read failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load SunShree booking information" });
  }
};

const uploadImage = (req, res) => {
  const uploadedFiles = [
    ...(req.files?.image || []),
    ...(req.files?.images || []),
    ...(req.file ? [req.file] : []),
  ];
  if (!uploadedFiles.length || uploadedFiles.some((file) => !(file.path || file.secure_url))) {
    return res.status(400).json({ success: false, message: "Select a supported image to upload" });
  }
  const urls = uploadedFiles.map((file) => file.path || file.secure_url);
  const publicIds = uploadedFiles.map((file) => file.filename || file.public_id || "");
  return res.status(201).json({
    success: true,
    data: { url: urls[0], urls, publicId: publicIds[0], publicIds },
  });
};

module.exports = { getAdminSettings, saveSettings, getPublicSettings, uploadImage };
