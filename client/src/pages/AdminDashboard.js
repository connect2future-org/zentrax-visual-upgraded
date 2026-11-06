import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../utils/api";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/ToastContext";
import AdminPropertyGalleryModal from "../components/sections/AdminPropertyGalleryModal";
import PropertyBookingManagement from "./PropertyBookingManagement";

const NAV = [
  { to: "/admin", label: "Overview", icon: "◈", end: true },
  { to: "/admin/managers", label: "Managers", icon: "◎" },
  { to: "/admin/clients", label: "Clients", icon: "◇" },
  { to: "/admin/properties", label: "Properties", icon: "⬡" },
  { to: "/admin/property-booking", label: "SunShree Booking Settings", icon: "⌂" },
];

function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then((data) => setStats(data.data || data.stats || data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "#888" }}>Loading…</p>;
  if (!stats) return null;

  const cards = [
    { label: "Total Projects", value: stats.total },
    { label: "Ongoing", value: stats.ongoing },
    { label: "Completed", value: stats.completed },
    { label: "Pending", value: stats.pending },
    { label: "Managers", value: stats.managers },
    { label: "Clients", value: stats.clients },
    { label: "Properties", value: stats.properties },
  ];

  return (
    <div className="stat-grid">
      {cards.map((c) => (
        <div className="stat-card" key={c.label}>
          <div className="stat-label">{c.label}</div>
          <div className="stat-value">{c.value ?? 0}</div>
        </div>
      ))}
    </div>
  );
}

function UserManager({ apiPath, roleLabel }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [confirm, setConfirm] = useState(null);
  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/${apiPath}`);
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [apiPath]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/${apiPath}`, form);
      setForm({ name: "", email: "", password: "" });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggle = async (item) => {
    try {
      await api.put(`/admin/${apiPath}/${item._id}/toggle`);
      addToast(`${roleLabel} status updated`, { type: "success" });
      loadData();
    } catch (err) {
      addToast(err.message || "Unable to update", { type: "error" });
    }
  };

  const handleRemove = async (id) => {
    setConfirm({ type: "user", id, title: `Remove this ${roleLabel}?` });
  };

  const confirmRemove = async () => {
    if (!confirm) return;
    if (confirm.type !== "user") return;
    try {
      await api.delete(`/admin/${apiPath}/${confirm.id}`);
      addToast(`${roleLabel} removed`, { type: "success" });
      setConfirm(null);
      await loadData();
    } catch (err) {
      addToast(err.message || "Remove failed", { type: "error" });
    }
  };

  return (
    <>
      <div className="dash-card">
        <div className="dash-card-title">Add {roleLabel}</div>
        <form onSubmit={handleAdd}>
          <div className="form-row">
            <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          </div>
          <button className="btn-gold" type="submit">Add {roleLabel}</button>
        </form>
      </div>
      <div className="dash-card">
        <div className="dash-card-title">All {roleLabel}s</div>
        {loading ? <p style={{ color: "#888" }}>Loading…</p> : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
              <tbody>
                {(data || []).map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.isActive ? "badge-completed" : "badge-pending"}`}>{u.isActive ? "Active" : "Inactive"}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <button className="btn-gold" onClick={() => handleToggle(u)}>{u.isActive ? "Deactivate" : "Activate"}</button>
                      <button className="btn-danger" onClick={() => handleRemove(u._id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirm}
        title={confirm?.title || "Confirm"}
        message={confirm?.title || ""}
        onCancel={() => setConfirm(null)}
        onConfirm={confirmRemove}
      />
    </>
  );
}

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [files, setFiles] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [replacementFiles, setReplacementFiles] = useState({});
  const [galleryModal, setGalleryModal] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    propertyType: "",
    propertyCategory: "Residential",
    address: "",
    city: "",
    state: "",
    country: "India",
    pinCode: "",
    floors: "",
    availability: "Available",
    suitableFor: "Families",
    description: "",
    features: "",
    googleMap: "",
    contactNumber: "",
    whatsappNumber: "",
    status: "Available",
    isFeatured: false,
    displayOnWebsite: true,
  });
  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/properties");
      setProperties(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      propertyType: "",
      propertyCategory: "Residential",
      address: "",
      city: "",
      state: "",
      country: "India",
      pinCode: "",
      floors: "",
      availability: "Available",
      suitableFor: "Families",
      description: "",
      features: "",
      googleMap: "",
      contactNumber: "",
      whatsappNumber: "",
      status: "Available",
      isFeatured: false,
      displayOnWebsite: true,
    });
    setFiles([]);
    setGallery([]);
    setReplacementFiles({});
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e) => setFiles(Array.from(e.target.files || []));
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (typeof value === "boolean") {
        form.append(key, value ? "true" : "false");
      } else {
        form.append(key, value);
      }
    });
    form.append("galleryImages", JSON.stringify(gallery));
    files.forEach((file) => form.append("images", file));
    Object.keys(replacementFiles).sort((a, b) => Number(a) - Number(b)).forEach((index) => form.append("replacementImages", replacementFiles[index]));
    form.append("replacementIndexes", JSON.stringify(Object.keys(replacementFiles).sort((a, b) => Number(a) - Number(b)).map(Number)));

    try {
      if (editId) {
        await api.put(`/admin/properties/${editId}`, form);
        addToast("Property updated", { type: "success" });
      } else {
        await api.post("/admin/properties", form);
        addToast("Property added", { type: "success" });
      }
      resetForm();
      loadData();
    } catch (err) {
      addToast(err.message || "Save failed", { type: "error" });
    }
  };

  const handleEdit = (property) => {
    setEditId(property._id);
    setFiles([]);
    setReplacementFiles({});
    setGallery(property.galleryImages || []);
    setFormData({
      name: property.name || "",
      propertyType: property.propertyType || "",
      propertyCategory: property.propertyCategory || "Residential",
      address: property.address || "",
      city: property.city || "",
      state: property.state || "",
      country: property.country || "India",
      pinCode: property.pinCode || "",
      floors: property.floors || "",
      availability: property.availability || "Available",
      suitableFor: property.suitableFor || "Families",
      description: property.description || "",
      features: Array.isArray(property.features) ? property.features.join(", ") : "",
      googleMap: property.googleMap || "",
      contactNumber: property.contactNumber || "",
      whatsappNumber: property.whatsappNumber || "",
      status: property.status || "Available",
      isFeatured: Boolean(property.isFeatured),
      displayOnWebsite: property.displayOnWebsite !== false,
    });
  };

  const handleDelete = (id) => setConfirm({ type: "property", id, title: "Delete this property?" });

  const confirmDelete = async () => {
    if (!confirm || confirm.type !== "property") return;
    try {
      await api.delete(`/admin/properties/${confirm.id}`);
      addToast("Property deleted", { type: "success" });
      setConfirm(null);
      loadData();
    } catch (err) {
      addToast(err.message || "Delete failed", { type: "error" });
    }
  };

  const toggleVisibility = async (property, visible) => {
    try {
      await api.patch(`/admin/properties/${property._id}/${visible ? "show" : "hide"}`);
      addToast(visible ? "Property shown" : "Property hidden", { type: "success" });
      loadData();
    } catch (err) {
      addToast(err.message || "Visibility update failed", { type: "error" });
    }
  };

  const toggleFeatured = async (property) => {
    try {
      await api.patch(`/admin/properties/${property._id}/feature`);
      addToast("Featured status updated", { type: "success" });
      loadData();
    } catch (err) {
      addToast(err.message || "Featured update failed", { type: "error" });
    }
  };

  return (
    <>
      <div className="dash-card">
        <div className="dash-card-title">{editId ? "Edit Property" : "Add Property"}</div>
        <form className="property-editor-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label>Property Name *</label><input name="name" value={formData.name} onChange={handleChange} required /></div>
            <div className="form-group"><label>Property Type *</label><input name="propertyType" value={formData.propertyType} onChange={handleChange} required /></div>
            <div className="form-group"><label>Category</label><input name="propertyCategory" value={formData.propertyCategory} onChange={handleChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Address</label><input name="address" value={formData.address} onChange={handleChange} /></div>
            <div className="form-group"><label>City</label><input name="city" value={formData.city} onChange={handleChange} /></div>
            <div className="form-group"><label>State</label><input name="state" value={formData.state} onChange={handleChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Country</label><input name="country" value={formData.country} onChange={handleChange} /></div>
            <div className="form-group"><label>Pin Code</label><input name="pinCode" value={formData.pinCode} onChange={handleChange} /></div>
            <div className="form-group"><label>Floors</label><input name="floors" value={formData.floors} onChange={handleChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Availability</label><input name="availability" value={formData.availability} onChange={handleChange} /></div>
            <div className="form-group"><label>Suitable For</label><input name="suitableFor" value={formData.suitableFor} onChange={handleChange} /></div>
            <div className="form-group"><label>Status</label><input name="status" value={formData.status} onChange={handleChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows="3" /></div>
            <div className="form-group"><label>Features (comma separated)</label><input name="features" value={formData.features} onChange={handleChange} /></div>
            <div className="form-group"><label>Google Map URL</label><input name="googleMap" value={formData.googleMap} onChange={handleChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Contact Number</label><input name="contactNumber" value={formData.contactNumber} onChange={handleChange} /></div>
            <div className="form-group"><label>WhatsApp Number</label><input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} /></div>
            <div className="form-group"><label>Gallery Images</label><input type="file" multiple accept="image/*" onChange={handleFileChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Property Gallery</label>
              {editId ? <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {gallery[0] ? <button type="button" className="property-gallery-trigger" onClick={() => setGalleryModal(properties.find((property) => property._id === editId) || { _id: editId, name: formData.name, galleryImages: gallery })}><img src={gallery[0]} alt="Open property gallery" /></button> : null}
                <button type="button" className="btn-gold" onClick={() => setGalleryModal(properties.find((property) => property._id === editId) || { _id: editId, name: formData.name, galleryImages: gallery })}>Manage Gallery</button>
              </div> : <span style={{ color: "var(--gray-mid)", fontSize: "0.78rem" }}>Save the property first to manage its gallery.</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label><input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} /> Featured</label>
            </div>
            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label><input type="checkbox" name="displayOnWebsite" checked={formData.displayOnWebsite} onChange={handleChange} /> Display on Website</label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-gold" type="submit">{editId ? "Save Property" : "Add Property"}</button>
            {editId ? <button type="button" className="btn-danger" onClick={resetForm}>Cancel</button> : null}
          </div>
        </form>
      </div>

      <div className="dash-card">
        <div className="dash-card-title">All Properties</div>
        {loading ? <p style={{ color: "#888" }}>Loading…</p> : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Featured</th><th>Visible</th><th>Action</th></tr></thead>
              <tbody>
                {(properties || []).map((property) => (
                  <tr key={property._id}>
                    <td>{property.name}</td>
                    <td>{property.propertyType}</td>
                    <td><span className={`badge ${property.isHidden ? "badge-pending" : "badge-completed"}`}>{property.status || "Available"}</span></td>
                    <td>{property.isFeatured ? "Yes" : "No"}</td>
                    <td>{property.displayOnWebsite !== false && !property.isHidden ? "Yes" : "No"}</td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <button className="btn-gold" onClick={() => handleEdit(property)}>Edit</button>
                      <button className="btn-gold" onClick={() => toggleFeatured(property)}>{property.isFeatured ? "Unfeature" : "Feature"}</button>
                      <button className="btn-gold" onClick={() => toggleVisibility(property, property.isHidden || property.displayOnWebsite === false)}>{property.isHidden || property.displayOnWebsite === false ? "Show" : "Hide"}</button>
                      <button className="btn-danger" onClick={() => handleDelete(property._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {galleryModal && <AdminPropertyGalleryModal property={galleryModal} addToast={addToast} onClose={() => setGalleryModal(null)} onSaved={(updated) => {
        setProperties((current) => current.map((property) => property._id === updated._id ? updated : property));
        setGallery(updated.galleryImages || []);
        setGalleryModal(updated);
      }} />}
      <ConfirmModal
        isOpen={!!confirm}
        title={confirm?.title || "Confirm"}
        message={confirm?.title || ""}
        onCancel={() => setConfirm(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard" navItems={NAV}>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="managers" element={<UserManager apiPath="managers" roleLabel="Manager" />} />
        <Route path="clients" element={<UserManager apiPath="clients" roleLabel="Client" />} />
        <Route path="properties" element={<Properties />} />
        <Route path="property-booking/*" element={<PropertyBookingManagement />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
