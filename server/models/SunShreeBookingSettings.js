const mongoose = require("mongoose");

const defaultBookingLinks = () => [
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

const bookingLinkSchema = new mongoose.Schema(
  {
    platformName: { type: String, required: true, trim: true, maxlength: 80 },
    bookingUrl: { type: String, required: true, trim: true, maxlength: 2048 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const sunShreeBookingSettingsSchema = new mongoose.Schema(
  {
    settingKey: {
      type: String,
      required: true,
      default: "sunshree-booking",
      immutable: true,
      unique: true,
      enum: ["sunshree-booking"],
    },
    popupEnabled: { type: Boolean, default: false },
    qrPopupEnabled: { type: Boolean, default: true },
    popupHeading: { type: String, default: "Welcome to SunShree", trim: true, maxlength: 120 },
    popupDescription: {
      type: String,
      default: "Choose your stay: residential accommodation or an Airbnb short stay.",
      trim: true,
      maxlength: 500,
    },
    popupButtonText: { type: String, default: "EXPLORE & BOOK NOW", trim: true, maxlength: 60 },
    popupImage: { type: String, default: "", trim: true, maxlength: 2048 },
    propertyPageEnabled: { type: Boolean, default: false },
    existingPropertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", default: null },
    propertyName: { type: String, default: "SunShree", trim: true, maxlength: 120 },
    propertyCategory: { type: String, default: "Residential", trim: true, maxlength: 80 },
    propertyDescription: { type: String, default: "", trim: true, maxlength: 5000 },
    propertyAddress: {
      type: String,
      default: "SunShree, 2nd Cross Road, Vijayanagara 3rd Stage, C Block, Garudachar Layout, Hootagalli, Mysuru, Karnataka 570030, India",
      trim: true,
      maxlength: 500,
    },
    propertyImage: { type: String, default: "", trim: true, maxlength: 2048 },
    propertyImages: { type: [{ type: String, trim: true, maxlength: 2048 }], default: [] },
    bookingLinks: {
      type: [bookingLinkSchema],
      default: defaultBookingLinks,
      validate: [(links) => links.length <= 20, "At most 20 booking links are allowed"],
    },
    residentialEnquiryMessage: {
      type: String,
      default: "Hello, I am interested in SunShree residential accommodation. Please share the residential details.",
      trim: true,
      maxlength: 1000,
    },
    whatsappNumber: {
      type: String,
      default: "919035999272",
      validate: {
        validator(value) {
          return value === "919035999272";
        },
        message: "WhatsApp assistance uses the fixed SunShree number +91 9035999272",
      },
    },
    whatsappMessage: {
      type: String,
      default: "Hello, I am interested in booking a stay at SunShree Residential Apartments in Mysuru. Please help me with availability, pricing and booking.",
      trim: true,
      maxlength: 1000,
    },
    whatsappEnabled: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SunShreeBookingSettings", sunShreeBookingSettingsSchema);
