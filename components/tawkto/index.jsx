// components/TawkChat.jsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";

// Seiten, auf denen das Bubble nicht erscheinen soll
const HIDE_ON = ["/products", "/configurator"];

export default function TawkChat() {
    const router = useRouter();
    const isLoaded = useRef(false); // merken, ob Tawk schon fertig ist

    // prüft Sichtbarkeit und ruft show/hide nur, wenn API bereit
    const updateVisibility = (url) => {
        if (!isLoaded.current || !window.Tawk_API) return;

        const hide = HIDE_ON.some((p) => url.startsWith(p));
        hide ? window.Tawk_API.hideWidget() : window.Tawk_API.showWidget();
    };

    useEffect(() => {
        // bei jedem Route-Change aufrufen
        router.events.on("routeChangeComplete", updateVisibility);
        return () => router.events.off("routeChangeComplete", updateVisibility);
    }, [router]);

    return (
        <TawkMessengerReact
            propertyId={process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID}
            widgetId={process.env.NEXT_PUBLIC_TAWK_WIDGET_ID}
            onLoad={() => {
                isLoaded.current = true; // Widget ist jetzt bereit
                updateVisibility(router.pathname); // gleich für aktuelle Route prüfen
            }}
        />
    );
}
