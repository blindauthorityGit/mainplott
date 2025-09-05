// hooks/useShopifyCustomer.js
import { useEffect, useState } from "react";
import { auth } from "@/config/firebase";

export function useShopifyCustomer(overrideEmail) {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    async function fetchCustomer(email) {
        if (!email) return;
        setLoading(true);
        setErrorMsg("");
        try {
            const r = await fetch("/api/shopifyGetUserInfo", {
                // <-- HIER: richtige Route
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const text = await r.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                console.error("API returned non-JSON:", text);
                throw new Error("API returned non-JSON");
            }

            if (!r.ok) {
                console.error("API error:", data);
                setErrorMsg(data?.error || "API error");
                setCustomer(null);
            } else {
                console.log("API ok:", data);
                setCustomer(data.customer || null);
            }
        } catch (e) {
            console.error("fetchCustomer failed:", e);
            setErrorMsg(e.message || "Unexpected error");
            setCustomer(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (overrideEmail) {
            fetchCustomer(overrideEmail);
            return;
        }
        const unsub = auth.onAuthStateChanged((user) => {
            const email = user?.email || null;
            fetchCustomer(email);
        });
        return () => unsub();
    }, [overrideEmail]);

    return { customer, loading, errorMsg, refetch: fetchCustomer };
}
