import React, { useState } from "react";

const WHATSAPP_NUMBER = "919035999272";
const PURPOSES = [
  "Residential Accommodation",
  "Airbnb / Short Stay",
  "General Property Enquiry",
];

const normalizeIndianMobile = (value) => {
  const digits = value.replace(/\D/g, "");
  const mobile = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(mobile) ? mobile : "";
};

export default function SunShreeWhatsAppAssistant({ enabled = true }) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [whatsAppUrl, setWhatsAppUrl] = useState("");

  if (!enabled) return null;

  const submitEnquiry = (event) => {
    event.preventDefault();
    const normalizedMobile = normalizeIndianMobile(mobile);
    if (!normalizedMobile) {
      setError("Enter a valid Indian mobile number (10 digits, starting with 6–9).");
      return;
    }

    const enquiry = [
      "Hello, I am enquiring about SunShree.",
      `Name: ${fullName.trim()}`,
      `Mobile: +91 ${normalizedMobile}`,
      `Purpose: ${purpose}`,
      message.trim() ? `Message: ${message.trim()}` : "",
    ].filter(Boolean).join("\n");
    const url = `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(enquiry)}`;

    setError("");
    setWhatsAppUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <aside className="sunshree-assistant" aria-label="SunShree WhatsApp enquiry assistant">
      {open && (
        <section className="sunshree-assistant-panel" aria-labelledby="sunshree-assistant-heading">
          <div className="sunshree-assistant-header">
            <h2 id="sunshree-assistant-heading">SunShree Enquiry Assistant</h2>
            <button type="button" className="sunshree-assistant-close" onClick={() => setOpen(false)} aria-label="Close enquiry assistant">×</button>
          </div>
          {whatsAppUrl ? (
            <div className="sunshree-assistant-result" role="status">
              <p>WhatsApp is ready with your message. Review and send it there to complete your enquiry. This form does not confirm a booking or send an enquiry by itself.</p>
              <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">Continue to WhatsApp</a>
            </div>
          ) : (
            <form className="sunshree-assistant-form" onSubmit={submitEnquiry}>
              <label>
                Full Name
                <input autoComplete="name" name="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} required maxLength={120} />
              </label>
              <label>
                Mobile Number
                <input
                  autoComplete="tel-national"
                  inputMode="tel"
                  name="mobile"
                  type="tel"
                  value={mobile}
                  onChange={(event) => { setMobile(event.target.value); setError(""); }}
                  placeholder="10-digit Indian number"
                  required
                  aria-describedby={error ? "sunshree-assistant-error" : undefined}
                />
              </label>
              <label>
                Purpose of Enquiry
                <select name="purpose" value={purpose} onChange={(event) => setPurpose(event.target.value)} required>
                  <option value="" disabled>Select a purpose</option>
                  {PURPOSES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>
                Short Message <span>(optional)</span>
                <textarea name="message" rows="3" maxLength={500} value={message} onChange={(event) => setMessage(event.target.value)} />
              </label>
              {error && <p className="sunshree-assistant-error" id="sunshree-assistant-error" role="alert">{error}</p>}
              <button className="sunshree-assistant-submit" type="submit">Continue to WhatsApp</button>
              <p className="sunshree-assistant-disclaimer">Your message opens in WhatsApp. It is not sent until you review and send it there.</p>
            </form>
          )}
        </section>
      )}
      <button
        className="sunshree-assistant-trigger"
        type="button"
        aria-expanded={open}
        aria-controls="sunshree-assistant-heading"
        onClick={() => { setOpen((current) => !current); setError(""); setWhatsAppUrl(""); }}
      >
        Need Help? WhatsApp Us
      </button>
    </aside>
  );
}
