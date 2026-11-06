import React, { useCallback, useEffect, useState } from "react";

const SUNSHREE_WHATSAPP_NUMBER = "919035999272";
const makeWhatsAppUrl = (settings, enquiryType) => {
  const message = [
    settings?.whatsapp?.message || "Hello, I am interested in SunShree.",
    `Enquiry type: ${enquiryType}`,
    "Property: SunShree",
  ].join("\n\n");
  return `https://web.whatsapp.com/send?phone=${SUNSHREE_WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
};

export default function SunShreeBookingPopup({ settings, preview = false, onClose }) {
  const popup = settings?.popup;
  const image = settings?.property?.image || settings?.property?.images?.[0] || popup?.image || "";
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const close = useCallback(() => onClose?.(), [onClose]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  if (!popup?.enabled) return null;

  return (
    <div className="sunshree-popup-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !preview) close(); }}>
      <section className="sunshree-popup-card" role="dialog" aria-modal="true" aria-labelledby="sunshree-popup-heading" aria-describedby="sunshree-popup-description">
        <button className="sunshree-popup-close" type="button" aria-label="Close SunShree booking popup" onClick={close}>×</button>
        <div className="sunshree-popup-layout">
          <div className="sunshree-popup-image-frame">
            {image && !imageUnavailable ? (
              <>
                <img className="sunshree-popup-image-background" src={image} alt="" aria-hidden="true" onError={() => setImageUnavailable(true)} />
                <img className="sunshree-popup-image" src={image} alt="SunShree residential property exterior" onError={() => setImageUnavailable(true)} />
              </>
            ) : (
              <div className="sunshree-popup-image-placeholder" role="img" aria-label="SunShree property photo placeholder">
                <span className="sunshree-popup-placeholder-mark" aria-hidden="true">S</span>
                <span>SUNSHREE</span>
                <small>MYSURU · A PLACE TO FEEL AT HOME</small>
              </div>
            )}
          </div>
          <div className="sunshree-popup-content">
            <p className="sunshree-popup-eyebrow">WELCOME TO SUNSHREE</p>
            <h2 id="sunshree-popup-heading">{popup.heading || "Welcome to SunShree"}</h2>
            <h3 className="sunshree-popup-subtitle">Find Your Perfect Stay</h3>
            <p id="sunshree-popup-description">{popup.description || "Choose the stay that feels right for you."}</p>
            <div className="sunshree-popup-actions">
              <article className="sunshree-popup-option sunshree-popup-option-residential">
                <span className="sunshree-popup-option-kicker">OPTION 01</span>
                <h3>Residential</h3>
                <p>Explore the property, learn about residential accommodation, and enquire about availability.</p>
                <a className="sunshree-book-button" href="/property-booking/sunshree#residential">Explore Residential</a>
                <a className="sunshree-popup-option-whatsapp" href={makeWhatsAppUrl(settings, "Residential accommodation enquiry")} target="_blank" rel="noopener noreferrer">WhatsApp residential enquiry</a>
              </article>
              <article className="sunshree-popup-option sunshree-popup-option-short-stay">
                <span className="sunshree-popup-option-kicker">OPTION 02</span>
                <h3>Airbnb / Short Stay</h3>
                <p>Find options for weekend stays, holidays, and other short-term accommodation.</p>
                <a className="sunshree-short-stay-button" href="/property-booking/sunshree#short-stay">Explore Short Stay</a>
              </article>
            </div>
            {settings?.whatsapp?.enabled && <a className="sunshree-popup-whatsapp" href={makeWhatsAppUrl(settings, "General SunShree stay assistance")} target="_blank" rel="noopener noreferrer">Need help choosing? WhatsApp us</a>}
          </div>
        </div>
      </section>
    </div>
  );
}
