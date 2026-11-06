export const sanitizeWhatsAppNumber = (value = "") => {
  let digits = String(value || "").replace(/[^0-9]/g, "");
  if (!digits) return "";

  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11) {
    if (digits.startsWith("0")) return `91${digits.slice(1)}`;
    if (digits.startsWith("1")) return `91${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 13 && digits.startsWith("091")) return digits.slice(1);
  if (digits.length === 14 && digits.startsWith("0091")) return digits.slice(2);

  return digits;
};

export const buildWhatsAppUrl = (number, propertyName = "", fallbackNumber = "") => {
  let cleaned = sanitizeWhatsAppNumber(number);
  if (!cleaned) cleaned = sanitizeWhatsAppNumber(fallbackNumber);
  if (!cleaned) return "";

  const message = `Hi, I am interested in the property \"${propertyName}\". Please share more details.`;
  return `https://web.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(message)}`;
};
