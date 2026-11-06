import React, { useEffect, useState } from "react";
import propertyLease from "../../assets/property-lease.jpg";
import api from "../../utils/api";
import PropertyLightbox from "./PropertyLightbox";
import { getPropertyCoverImage, getPropertyGalleryImages } from "../../utils/propertyImages";
import { buildWhatsAppUrl } from "../../utils/whatsapp";

function PropertiesSection() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get("/properties?limit=4")
      .then((res) => {
        const props = res.data || [];
        // Sort properties in desired order
        const orderMap = {
          'Hombelaku Residences': 1,
          'Lease Opportunity': 2,
          'SunShree': 3
        };
        props.sort((a, b) => (orderMap[a.name] || 999) - (orderMap[b.name] || 999));
        setProperties(props);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const openGallery = (property) => {
    const images = getPropertyGalleryImages(property);
    if (images.length) setLightbox({ propertyName: property.name, images, index: 0 });
  };

  return (
    <section id="properties" className="section properties-section">
      <div className="container">
        <div className="section-tag reveal">Available Now</div>
        <h2 className="section-title reveal">
          Properties
          <br />
          <em>For Lease</em>
        </h2>
        <p className="section-desc reveal">
          Premium residential spaces built with precision and elegance - ready for immediate
          occupancy.
        </p>

        {loading ? (
          <p style={{ color: "#c7b383" }}>Loading properties…</p>
        ) : properties.length ? (
          properties.map((property) => (
            <div key={property._id} className="prop-feature-card" style={{ cursor: "default" }}>
              <div className="prop-img-col">
                <div className="prop-img-wrap" onClick={() => openGallery(property)} role="button" tabIndex={0} aria-label={`Open ${property.name} image gallery`} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") openGallery(property); }} style={{ cursor: getPropertyGalleryImages(property).length ? "pointer" : "default" }}>
                  <img src={getPropertyCoverImage(property) || propertyLease} alt={property.name} loading="lazy" onError={(e) => { e.target.src = propertyLease; }} />
                </div>
              </div>
              <div className="prop-details-col">
                <div className="prop-tag">{property.propertyCategory || "Property"}</div>
                <h3 className="prop-name">{property.name}</h3>
                <p className="prop-location">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {property.address}, {property.city}, {property.state}, {property.country}
                </p>
                <div className="prop-divider"></div>
                <div className="prop-features-grid">
                  <div className="prop-feat">
                    <div className="prop-feat-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <div>
                      <span className="prop-feat-label">Type</span>
                      <span className="prop-feat-val">{property.propertyType}</span>
                    </div>
                  </div>
                  <div className="prop-feat">
                    <div className="prop-feat-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                    </div>
                    <div>
                      <span className="prop-feat-label">Floors</span>
                      <span className="prop-feat-val">{property.floors || "—"}</span>
                    </div>
                  </div>
                  <div className="prop-feat">
                    <div className="prop-feat-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4l3 3" />
                      </svg>
                    </div>
                    <div>
                      <span className="prop-feat-label">Availability</span>
                      <span className="prop-feat-val">{property.availability}</span>
                    </div>
                  </div>
                  <div className="prop-feat">
                    <div className="prop-feat-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                      </svg>
                    </div>
                    <div>
                      <span className="prop-feat-label">Suitable For</span>
                      <span className="prop-feat-val">{property.suitableFor}</span>
                    </div>
                  </div>
                </div>
                <div className="prop-divider"></div>
                <p className="prop-description">{property.description || "Property details managed by the admin."}</p>
                <div className="prop-ctas">
                  <a href="#contact" className="btn-gold">Enquire Now</a>
                  <a href={buildWhatsAppUrl(property.whatsappNumber, property.name, property.contactNumber)} className="btn-outline-dark" target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="prop-feature-card"><div className="prop-details-col"><p className="prop-description">No properties are currently visible on the website.</p></div></div>
        )}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a href="/properties" className="btn-outline-dark" style={{ display: "inline-block" }}>View More</a>
        </div>
      </div>
      {lightbox && <PropertyLightbox images={lightbox.images} index={lightbox.index} propertyName={lightbox.propertyName} onClose={() => setLightbox(null)} onPrevious={() => setLightbox((current) => ({ ...current, index: (current.index - 1 + current.images.length) % current.images.length }))} onNext={() => setLightbox((current) => ({ ...current, index: (current.index + 1) % current.images.length }))} />}
    </section>
  );
}

export default PropertiesSection;
