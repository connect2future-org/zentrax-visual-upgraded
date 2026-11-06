const STANDARD_PLATFORM_DOMAINS = {
  airbnb: ["airbnb.com"],
  agoda: ["agoda.com"],
  "booking.com": ["booking.com"],
  makemytrip: ["makemytrip.com"],
};

const normalizeIndianWhatsAppNumber = (value) => {
  const raw = String(value || "").trim();
  if (!/^\+?[\d\s()-]+$/.test(raw)) return "";
  const digits = raw.replace(/\D/g, "");
  const national = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(national) ? `91${national}` : "";
};

const isHttpsBookingUrl = (value) => {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && (!url.port || url.port === "443");
  } catch {
    return false;
  }
};

const isAllowedBookingUrl = (value, platformName) => {
  if (!isHttpsBookingUrl(value)) return false;
  const platformKey = String(platformName || "").trim().toLowerCase();
  const domains = STANDARD_PLATFORM_DOMAINS[platformKey];
  if (!domains) return true;
  const hostname = new URL(value).hostname.toLowerCase();
  return domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
};

module.exports = { normalizeIndianWhatsAppNumber, isHttpsBookingUrl, isAllowedBookingUrl };
