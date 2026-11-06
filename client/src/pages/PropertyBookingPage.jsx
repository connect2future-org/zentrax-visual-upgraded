import React, { useEffect, useState } from "react";
import api from "../utils/api";
import SunShreePropertyView from "../components/propertyBooking/SunShreePropertyView";
import "./PropertyBookingPage.css";

export default function PropertyBookingPage() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/property-booking/settings")
      .then((response) => { if (active) setSettings(response.data); })
      .catch((requestError) => { if (active) setError(requestError.message || "Unable to load SunShree booking information"); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!settings || !window.location.hash) return;
    const sectionId = window.location.hash.slice(1);
    window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    });
  }, [settings]);

  if (error) return <main className="sunshree-public-page"><p className="sunshree-unavailable" role="alert">{error}</p></main>;
  if (!settings) return <main className="sunshree-public-page"><p className="sunshree-unavailable">Loading SunShree booking information…</p></main>;
  return <SunShreePropertyView settings={settings} />;
}
