import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureAttribution } from "@/lib/attribution";

export default function AttributionCapture() {
  const location = useLocation();
  useEffect(() => {
    captureAttribution();
  }, [location.pathname, location.search]);
  return null;
}
