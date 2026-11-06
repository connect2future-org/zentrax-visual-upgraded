import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../utils/api";
import SunShreeBookingPopup from "./SunShreeBookingPopup";

export default function SunShreeQrPopupGate() {
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (location.pathname !== "/") {
      setSettings(null);
      setVisible(false);
      return undefined;
    }

    let active = true;
    setSettings(null);
    setVisible(false);

    api.get("/property-booking/settings")
      .then((response) => {
        if (!active) return;
        const data = response.data;
        if (!data || typeof data !== "object" || !data.popup) {
          throw new Error("Public settings response is missing popup configuration");
        }
        if (!data.popup.enabled || !data.propertyPageEnabled) return;

        setSettings(data);
        window.setTimeout(() => {
          if (active) setVisible(true);
        }, 1000);
      })
      .catch((error) => {
        console.error("[SUNSHREE POPUP] Unable to load public settings:", error.message);
      });

    return () => {
      active = false;
    };
  }, [location.pathname]);

  return visible ? <SunShreeBookingPopup settings={settings} onClose={() => setVisible(false)} /> : null;
}
