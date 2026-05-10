import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { trackEvent } from "@/lib/tracking";

const COOKIE_KEY = "ldx_ref";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export default function ReferralCapturePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      document.cookie = `${COOKIE_KEY}=${encodeURIComponent(code)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
      try { localStorage.setItem(COOKIE_KEY, code); } catch {}
      trackEvent("referral.attributed.v1", { code, path: "/r/" + code });
    }
    navigate("/", { replace: true });
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="font-display text-primary uppercase tracking-wider">Welcome to 91 Fitz...</p>
    </div>
  );
}

export function getStoredReferralCode(): string | null {
  try {
    const ls = localStorage.getItem(COOKIE_KEY);
    if (ls) return ls;
  } catch {}
  const m = document.cookie.match(/(?:^|; )ldx_ref=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
