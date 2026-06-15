"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, config: object) => void;
        };
      };
    };
  }
}

export function GoogleLoginButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { login }    = useAuth();
  const router       = useRouter();

  useEffect(() => {
    const scriptId = "google-gsi";
    if (!document.getElementById(scriptId)) {
      const script    = document.createElement("script");
      script.id       = scriptId;
      script.src      = "https://accounts.google.com/gsi/client";
      script.async    = true;
      script.defer    = true;
      script.onload   = init;
      document.head.appendChild(script);
    } else {
      init();
    }

    function init() {
      if (!window.google || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback:  async (response: { credential: string }) => {
          try {
            await login(response.credential);
            router.replace("/dashboard");
          } catch {
            alert("Login failed. Please try again.");
          }
        },
      });
      window.google.accounts.id.renderButton(containerRef.current!, {
        theme: "outline", size: "large", width: "320",
      });
    }
  }, [login, router]);

  return <div ref={containerRef} className="flex justify-center" />;
}
