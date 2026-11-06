import React, { useEffect, useState } from "react";
import api from "../utils/api";
import PropertyLightbox from "../components/sections/PropertyLightbox";
import { getPropertyGalleryImages, getPropertyPrimaryImage } from "../utils/propertyImages";
import "./PropertiesPage.css";

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get("/properties")
      .then((res) => setProperties(res.data || []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const openGallery = (property) => {
    const images = getPropertyGalleryImages(property);
    if (images.length) setLightbox({ propertyName: property.name, images, index: 0 });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060606", color: "#f4f0e6", padding: "3rem 1.25rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Properties</h1>
        <p style={{ color: "#bfb59e", marginBottom: "2rem" }}>A curated list of visible properties managed by the admin.</p>
        {loading ? <p>Loading properties...</p> : properties.length === 0 ? <p>No properties available right now.</p> : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {properties.map((property) => (
              <article className="properties-list-card" key={property._id}>
                {getPropertyPrimaryImage(property) ? (
                  <button className="properties-list-photo-button" type="button" onClick={() => openGallery(property)} aria-label={`Open ${property.name} image gallery`}>
                    <img
                      className="properties-list-photo"
                      src={getPropertyPrimaryImage(property)}
                      alt={`${property.name} property`}
                      loading="lazy"
                      onLoad={(event) => event.currentTarget.classList.add("loaded")}
                      onError={(event) => {
                        event.currentTarget.hidden = true;
                        event.currentTarget.parentElement.classList.add("properties-list-photo-button-empty");
                      }}
                    />
                    {getPropertyGalleryImages(property).length > 1 && <span className="properties-list-photo-count">{getPropertyGalleryImages(property).length} photos</span>}
                  </button>
                ) : (
                  <div className="properties-list-photo-placeholder" role="img" aria-label={`${property.name} has no property photos yet`}>
                    Property photos coming soon
                  </div>
                )}
                <div className="properties-list-content">
                  <div className="properties-list-heading">
                    <div>
                      <h3 style={{ margin: "0 0 0.4rem" }}>{property.name}</h3>
                      <p style={{ margin: 0, color: "#c8b98e" }}>{property.propertyType} · {[property.city, property.state].filter(Boolean).join(", ")}</p>
                    </div>
                    {property.isFeatured && <span style={{ color: "#d4af37", fontWeight: 700 }}>Featured</span>}
                  </div>
                  <p className="properties-list-description">{property.description || "Professional property listing from Zentrax."}</p>
                  <div className="properties-list-tags">
                    <span>{property.availability}</span>
                    <span>{property.suitableFor}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      {lightbox && <PropertyLightbox images={lightbox.images} index={lightbox.index} propertyName={lightbox.propertyName} onClose={() => setLightbox(null)} onPrevious={() => setLightbox((current) => ({ ...current, index: (current.index - 1 + current.images.length) % current.images.length }))} onNext={() => setLightbox((current) => ({ ...current, index: (current.index + 1) % current.images.length }))} />}
    </div>
  );
}