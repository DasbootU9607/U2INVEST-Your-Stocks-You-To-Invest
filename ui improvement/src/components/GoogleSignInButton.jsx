import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const SCRIPT_ID = "google-identity-services";

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function GoogleSignInButton({ onSuccess }) {
  const containerRef = useRef(null);
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Google sign-in is not configured yet.");
      setLoading(false);
      return;
    }

    async function setup() {
      try {
        setLoading(true);
        const google = await loadGoogleScript();
        if (!active || !containerRef.current || !google?.accounts?.id) return;

        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              setError("");
              const user = await loginWithGoogle(response.credential);
              onSuccess?.(user);
            } catch (err) {
              setError(err.message || "Google sign-in failed.");
            }
          },
          ux_mode: "popup",
        });

        containerRef.current.innerHTML = "";
        google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "left",
          width: 280,
        });
      } catch {
        if (active) {
          setError("Failed to load Google sign-in.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    setup();

    return () => {
      active = false;
    };
  }, [loginWithGoogle, onSuccess]);

  return (
    <div className="space-y-3">
      <div className="min-h-[44px] flex items-center justify-center" ref={containerRef}>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
