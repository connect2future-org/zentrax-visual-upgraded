import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useToast } from "../components/ui/ToastContext";
import SunShreeBookingPopup from "../components/propertyBooking/SunShreeBookingPopup";
import SunShreePropertyView from "../components/propertyBooking/SunShreePropertyView";
import "./PropertyBookingManagement.css";

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

const EMPTY_FORM = {
  popup: {
    enabled: false,
    qrEnabled: true,
    heading: "Welcome to SunShree",
    description: "Choose your stay: residential accommodation or an Airbnb short stay.",
    buttonText: "EXPLORE & BOOK NOW",
    image: "",
  },
  property: {
    pageEnabled: false,
    existingPropertyId: "",
    name: "SunShree",
    category: "Residential",
    description: "",
    address: "SunShree, 2nd Cross Road, Vijayanagara 3rd Stage, C Block, Garudachar Layout, Hootagalli, Mysuru, Karnataka 570030, India",
    image: "",
    images: [],
  },
  bookingLinks: DEFAULT_BOOKING_LINKS,
  residentialEnquiryMessage: "Hello, I am interested in SunShree residential accommodation. Please share the residential details.",
  whatsapp: {
    number: "919035999272",
    message: "Hello, I am interested in booking a stay at SunShree Residential Apartments in Mysuru. Please help me with availability, pricing and booking.",
    enabled: true,
  },
};

const normalizeSettings = (data = {}) => ({
  popup: {
    enabled: Boolean(data.popupEnabled),
    qrEnabled: true,
    heading: data.popupHeading || EMPTY_FORM.popup.heading,
    description: data.popupDescription || EMPTY_FORM.popup.description,
    buttonText: data.popupButtonText || EMPTY_FORM.popup.buttonText,
    image: data.popupImage || "",
  },
  property: {
    pageEnabled: Boolean(data.propertyPageEnabled),
    existingPropertyId: data.existingPropertyId ? String(data.existingPropertyId) : "",
    name: data.property?.name || data.propertyName || EMPTY_FORM.property.name,
    category: data.property?.category || data.propertyCategory || EMPTY_FORM.property.category,
    description: data.property?.description || data.propertyDescription || "",
    address: data.property?.address || data.propertyAddress || EMPTY_FORM.property.address,
    image: data.property?.image || data.propertyImage || "",
    images: data.property?.images?.length ? data.property.images : [data.property?.image || data.propertyImage].filter(Boolean),
  },
  bookingLinks: (data.bookingLinks?.length ? data.bookingLinks : DEFAULT_BOOKING_LINKS).map((link) => ({
    platformName: link.platformName || "",
    bookingUrl: link.bookingUrl || "",
    isActive: Boolean(link.isActive),
  })),
  residentialEnquiryMessage: data.residentialEnquiryMessage || EMPTY_FORM.residentialEnquiryMessage,
  whatsapp: {
    number: "919035999272",
    message: data.whatsappMessage || EMPTY_FORM.whatsapp.message,
    enabled: data.whatsappEnabled !== false,
  },
  availableProperties: data.availableProperties || [],
  existingPropertyFound: Boolean(data.existingPropertyFound),
});

export default function PropertyBookingManagement() {
  const { addToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [previews, setPreviews] = useState({});
  const [preview, setPreview] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/admin/property-booking/settings")
      .then((response) => {
        if (!active) return;
        const next = normalizeSettings(response.data);
        setForm(next);
        setAvailableProperties(next.availableProperties);
      })
      .catch((error) => addToast(error.message || "Unable to load SunShree settings", { type: "error" }))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [addToast]);

  const publicPreview = useMemo(() => ({
    popup: { ...form.popup, enabled: form.popup.enabled },
    propertyPageEnabled: form.property.pageEnabled,
    property: { ...form.property },
    bookingLinks: form.bookingLinks.filter((link) => link.isActive),
    whatsapp: { ...form.whatsapp, enabled: form.whatsapp.enabled },
  }), [form]);

  const updateSection = (section, values) => {
    setForm((current) => ({ ...current, [section]: { ...current[section], ...values } }));
  };

  const uploadImage = async (field, file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type) || file.size > 8 * 1024 * 1024) {
      addToast("Choose a JPG, PNG, or WebP image up to 8 MB", { type: "error" });
      return;
    }
    const localPreview = URL.createObjectURL(file);
    setPreviews((current) => ({ ...current, [field]: localPreview }));
    setUploading(field);
    try {
      const payload = new FormData();
      payload.append("image", file);
      const response = await api.post("/admin/property-booking/images", payload);
      const target = field === "popupImage" ? "popup" : "property";
      updateSection(target, { image: response.data.url });
      URL.revokeObjectURL(localPreview);
      setPreviews((current) => ({ ...current, [field]: "" }));
      addToast("Image uploaded. Save settings to publish it.", { type: "success" });
    } catch (error) {
      URL.revokeObjectURL(localPreview);
      setPreviews((current) => ({ ...current, [field]: "" }));
      addToast(error.message || "Image upload failed", { type: "error" });
    } finally {
      setUploading("");
    }
  };

  const uploadResidentialImages = async (files) => {
    if (!files.length) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (files.length + form.property.images.length > 10 || files.some((file) => !allowed.includes(file.type) || file.size > 8 * 1024 * 1024)) {
      addToast("Choose up to 10 JPG, PNG, or WebP images, each up to 8 MB", { type: "error" });
      return;
    }
    const localPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((current) => ({ ...current, propertyImages: localPreviews }));
    setUploading("propertyImages");
    try {
      const payload = new FormData();
      files.forEach((file) => payload.append("images", file));
      const response = await api.post("/admin/property-booking/images", payload);
      const uploadedImages = response.data.urls || [response.data.url];
      updateSection("property", {
        image: form.property.image || uploadedImages[0],
        images: [...form.property.images, ...uploadedImages],
      });
      addToast("Residential photos uploaded. Save settings to publish them.", { type: "success" });
    } catch (error) {
      addToast(error.message || "Residential photo upload failed", { type: "error" });
    } finally {
      localPreviews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews((current) => ({ ...current, propertyImages: [] }));
      setUploading("");
    }
  };

  const updateBookingLink = (index, values) => {
    setForm((current) => ({
      ...current,
      bookingLinks: current.bookingLinks.map((link, itemIndex) => itemIndex === index ? { ...link, ...values } : link),
    }));
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.put("/admin/property-booking/settings", form);
      addToast("SunShree booking settings saved", { type: "success" });
    } catch (error) {
      addToast(error.message || "Unable to save SunShree settings", { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="pbm"><section className="pbm-card"><p>Loading SunShree booking settings…</p></section></div>;

  return (
    <div className="pbm sunshree-admin">
      <header className="pbm-header">
        <p className="pbm-eyebrow">PROPERTY BOOKING</p>
        <h1>SunShree Booking Settings</h1>
        <p>Manage the homepage popup, existing SunShree property details, booking links, and WhatsApp assistance in one place.</p>
      </header>

      <form className="pbm-card pbm-form" onSubmit={save}>
        <section className="sunshree-admin-section">
          <h2>A. Homepage popup settings</h2>
          <p className="pbm-muted">When enabled, the popup appears on each homepage load, regardless of how visitors arrive.</p>
          <div className="sunshree-form-grid">
            <label className="pbm-checkbox"><input type="checkbox" checked={form.popup.enabled} onChange={(event) => updateSection("popup", { enabled: event.target.checked })} /> Enable popup</label>
            <label>Popup heading<input maxLength={120} value={form.popup.heading} onChange={(event) => updateSection("popup", { heading: event.target.value })} /></label>
            <label>Popup button text<input maxLength={60} value={form.popup.buttonText} onChange={(event) => updateSection("popup", { buttonText: event.target.value })} /></label>
            <label className="sunshree-span-all">Popup description<textarea rows="3" maxLength={500} value={form.popup.description} onChange={(event) => updateSection("popup", { description: event.target.value })} /></label>
            <label className="sunshree-span-all">Popup image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(uploading)} onChange={(event) => { uploadImage("popupImage", event.target.files?.[0]); event.target.value = ""; }} /></label>
          </div>
          {(previews.popupImage || form.popup.image || form.property.image) && <img className="sunshree-admin-image" src={previews.popupImage || form.popup.image || form.property.image} alt="SunShree popup preview" />}
        </section>

        <section className="sunshree-admin-section">
          <h2>B. Residential information</h2>
          <p className="pbm-muted">This links to an existing SunShree record when one is available. It never creates or edits the existing property record.</p>
          {availableProperties.length > 0 ? (
            <label>Existing SunShree property
              <select value={form.property.existingPropertyId} onChange={(event) => {
                const selected = availableProperties.find((property) => String(property._id) === event.target.value);
                updateSection("property", {
                  existingPropertyId: event.target.value,
                  ...(selected ? {
                    name: form.property.name || "SunShree",
                    category: selected.propertyCategory || form.property.category,
                    address: selected.address || form.property.address,
                    image: selected.coverImage || selected.image || form.property.image,
                    images: selected.galleryImages?.length ? selected.galleryImages : [selected.coverImage || selected.image].filter(Boolean),
                  } : {}),
                });
              }}>
                <option value="">Select an existing SunShree property</option>
                {availableProperties.map((property) => <option key={property._id} value={property._id}>{property.name} — {property.address}</option>)}
              </select>
            </label>
          ) : <p className="pbm-muted">No existing SunShree property record was found. Add and publish the building through the existing Properties module before enabling this public page.</p>}
          <div className="sunshree-form-grid">
            <label className="pbm-checkbox"><input type="checkbox" checked={form.property.pageEnabled} onChange={(event) => updateSection("property", { pageEnabled: event.target.checked })} /> Enable public SunShree page</label>
            <label>Building name<input maxLength={120} value={form.property.name} onChange={(event) => updateSection("property", { name: event.target.value })} /></label>
            <label>Property category<input maxLength={80} value={form.property.category} onChange={(event) => updateSection("property", { category: event.target.value })} /></label>
            <label className="sunshree-span-all">Building description<textarea rows="4" maxLength={5000} value={form.property.description} onChange={(event) => updateSection("property", { description: event.target.value })} /></label>
            <label className="sunshree-span-all">Building location / address<textarea rows="2" maxLength={500} value={form.property.address} onChange={(event) => updateSection("property", { address: event.target.value })} /></label>
            <label className="sunshree-span-all">Residential photographs<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={Boolean(uploading)} onChange={(event) => { uploadResidentialImages(Array.from(event.target.files || [])); event.target.value = ""; }} /></label>
          </div>
          <div className="sunshree-admin-gallery">
            {[...form.property.images, ...(previews.propertyImages || [])].map((image, index) => (
              <figure key={`${image}-${index}`}>
                <img className="sunshree-admin-image" src={image} alt={`SunShree residential photo ${index + 1}`} />
                {index < form.property.images.length && <button type="button" className="pbm-button pbm-button-danger" onClick={() => updateSection("property", {
                  images: form.property.images.filter((_, imageIndex) => imageIndex !== index),
                  image: index === 0 ? (form.property.images[1] || "") : form.property.image,
                })}>Remove photo</button>}
              </figure>
            ))}
          </div>
          <label className="sunshree-span-all">Residential enquiry details<textarea rows="3" maxLength={1000} value={form.residentialEnquiryMessage} onChange={(event) => setForm((current) => ({ ...current, residentialEnquiryMessage: event.target.value }))} /></label>
        </section>

        <section className="sunshree-admin-section">
          <h2>C. Airbnb / short-stay booking links</h2>
          <p className="pbm-muted">Airbnb and Agoda are separate listings and may represent different units. Availability and reservations are handled on each platform.</p>
          {form.bookingLinks.map((link, index) => (
            <div className="sunshree-link-editor" key={`${index}-${link.platformName}`}>
              <label>Platform name<input maxLength={80} value={link.platformName} onChange={(event) => updateBookingLink(index, { platformName: event.target.value })} /></label>
              <label>HTTPS booking URL<input type="url" maxLength={2048} value={link.bookingUrl} onChange={(event) => updateBookingLink(index, { bookingUrl: event.target.value })} /></label>
              <label className="pbm-checkbox"><input type="checkbox" checked={link.isActive} onChange={(event) => updateBookingLink(index, { isActive: event.target.checked })} /> Enabled</label>
              <button type="button" className="pbm-button pbm-button-danger" onClick={() => setForm((current) => ({ ...current, bookingLinks: current.bookingLinks.filter((_, itemIndex) => itemIndex !== index) }))}>Remove</button>
            </div>
          ))}
          <button type="button" className="pbm-button pbm-button-muted" onClick={() => setForm((current) => ({ ...current, bookingLinks: [...current.bookingLinks, { platformName: current.bookingLinks.some((link) => link.platformName.toLowerCase() === "airbnb") ? "Agoda" : "Airbnb", bookingUrl: "", isActive: true }] }))}>Add Airbnb, Agoda, or other booking link</button>
        </section>

        <section className="sunshree-admin-section">
          <h2>D. WhatsApp assistance</h2>
          <div className="sunshree-form-grid">
            <label className="pbm-checkbox"><input type="checkbox" checked={form.whatsapp.enabled} onChange={(event) => updateSection("whatsapp", { enabled: event.target.checked })} /> Enable WhatsApp assistance</label>
            <p className="pbm-muted">WhatsApp assistance always opens a chat with +91 9035999272.</p>
            <label className="sunshree-span-all">Prefilled WhatsApp message<textarea rows="4" maxLength={1000} value={form.whatsapp.message} onChange={(event) => updateSection("whatsapp", { message: event.target.value })} /></label>
          </div>
        </section>

        <div className="sunshree-form-actions">
          <button className="pbm-button" type="submit" disabled={saving || Boolean(uploading)}>{saving ? "Saving…" : "Save Settings"}</button>
          <button className="pbm-button pbm-button-muted" type="button" onClick={() => setPreview("popup")}>Preview Popup</button>
          <button className="pbm-button pbm-button-muted" type="button" onClick={() => setPreview("property")}>Preview Property Section</button>
          <Link className="pbm-button pbm-button-muted" to="/property-booking/sunshree" target="_blank" rel="noopener noreferrer">Open Public Page</Link>
        </div>
      </form>

      {preview === "popup" && <SunShreeBookingPopup settings={publicPreview} preview onClose={() => setPreview("")} />}
      {preview === "property" && <div className="sunshree-preview-overlay" role="dialog" aria-modal="true" aria-label="SunShree property preview"><button className="sunshree-preview-close" type="button" onClick={() => setPreview("")} aria-label="Close preview">×</button><SunShreePropertyView settings={publicPreview} preview /></div>}
    </div>
  );
}
