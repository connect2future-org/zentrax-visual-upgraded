import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Zentrax          from "./components/Zentrax";
import LandingPage      from "./pages/LandingPage";
import LoginPage        from "./pages/LoginPage";
import SignupPage       from "./pages/SignupPage";
import AdminDashboard   from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import Layout from "./components/layout/Layout";
import ClientDashboard  from "./pages/ClientDashboard";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyBookingPage from "./pages/PropertyBookingPage";
import NotFound         from "./pages/NotFound";
import SunShreeQrPopupGate from "./components/propertyBooking/SunShreeQrPopupGate";

// ── Protected Route ───────────────────────────────────────────────────────────
// Redirects to /login if unauthenticated; redirects wrong-role users to their
// own dashboard.
function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loader-screen">
        <div className="loader-spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRole && user.role !== allowedRole && user.role !== "admin") {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}

// ── Role redirect after login ─────────────────────────────────────────────────
function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<><Zentrax /><SunShreeQrPopupGate /></>} />
          <Route path="/landing" element={<Zentrax />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/property-booking/sunshree" element={<PropertyBookingPage />} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />

          {/* Dashboard shortcut — redirects by role */}
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* Protected dashboards */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRole="admin">
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/*"
            element={
              <ProtectedRoute allowedRole="manager">
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/*"
            element={
              <ProtectedRoute allowedRole="client">
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
