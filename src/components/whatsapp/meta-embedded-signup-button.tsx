"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type MetaLoginResponse = {
  authResponse?: {
    code?: string;
  };
  status?: string;
};

declare global {
  interface Window {
    FB?: {
      init: (options: {
        appId: string;
        autoLogAppEvents?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: MetaLoginResponse) => void,
        options: Record<string, unknown>
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

type SignupSession = {
  wabaId?: string;
  phoneNumberId?: string;
  businessId?: string;
};

type EmbeddedSignupEvent = {
  type?: string;
  event?: string;
  data?: {
    waba_id?: string;
    phone_number_id?: string;
    business_id?: string;
  };
};

function parseSignupEvent(data: unknown): EmbeddedSignupEvent | null {
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as EmbeddedSignupEvent;
    } catch {
      return null;
    }
  }

  if (typeof data === "object" && data) {
    return data as EmbeddedSignupEvent;
  }

  return null;
}

export function MetaEmbeddedSignupButton() {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID || "";
  const configId = process.env.NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID || "";
  const [ready, setReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [session, setSession] = useState<SignupSession>({});

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.origin.includes("facebook.com")) return;

      const payload = parseSignupEvent(event.data);

      if (payload?.type !== "WA_EMBEDDED_SIGNUP") return;

      setSession({
        wabaId: payload.data?.waba_id,
        phoneNumberId: payload.data?.phone_number_id,
        businessId: payload.data?.business_id,
      });
    }

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (!appId || !configId) return;

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        autoLogAppEvents: true,
        xfbml: true,
        version: "v21.0",
      });
      setReady(true);
    };

    if (document.getElementById("facebook-jssdk")) {
      window.setTimeout(() => setReady(Boolean(window.FB)), 0);
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [appId, configId]);

  async function saveConnection(code: string) {
    const response = await fetch("/api/whatsapp/embedded-signup/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        ...session,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "WhatsApp connection failed.");
    }

    if (data.tokenStored) {
      toast.success("WhatsApp connection saved.");
    } else {
      toast.success("WhatsApp IDs saved.");
      toast.info(
        "Set WHATSAPP_TOKEN_ENCRYPTION_KEY to store Meta tokens securely."
      );
    }

    window.location.reload();
  }

  async function completeSignup(response: MetaLoginResponse) {
    try {
      const code = response.authResponse?.code;

      if (!code) {
        toast.error("Meta did not return an authorization code.");
        return;
      }

      await saveConnection(code);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save WhatsApp connection."
      );
    } finally {
      setConnecting(false);
    }
  }

  function handleLoginResponse(response: MetaLoginResponse) {
    void completeSignup(response);
  }

  function startSignup() {
    if (!appId || !configId) {
      toast.error("Meta Embedded Signup env vars are missing.");
      return;
    }

    if (!window.FB || !ready) {
      toast.error("Meta SDK is still loading. Try again in a moment.");
      return;
    }

    if (window.location.protocol !== "https:") {
      toast.error(
        "Meta Embedded Signup requires HTTPS. Test from your Vercel URL or use an HTTPS tunnel."
      );
      return;
    }

    setConnecting(true);

    try {
      window.FB.login(handleLoginResponse, {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          sessionInfoVersion: "3",
        },
      });
    } catch (error) {
      setConnecting(false);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not start Meta Embedded Signup."
      );
    }
  }

  return (
    <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">
            Connect WhatsApp with Meta
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
            Start Meta Embedded Signup to connect a restaurant WhatsApp Business
            account to this ServeFlow workspace. You must be logged in before
            connecting.
          </p>
        </div>

        <Button
          type="button"
          onClick={startSignup}
          disabled={connecting || !appId || !configId}
          className="h-10 rounded-full bg-white px-5 text-sm text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
        >
          {connecting ? (
            <Loader2 className="mr-2 animate-spin" size={16} />
          ) : (
            <MessageCircle className="mr-2" size={16} />
          )}
          {connecting ? "Connecting..." : "Connect WhatsApp"}
        </Button>
      </div>

      {(!appId || !configId) && (
        <p className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-sm leading-6 text-yellow-100">
          Add NEXT_PUBLIC_META_APP_ID and NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID
          before testing Embedded Signup.
        </p>
      )}
    </div>
  );
}
