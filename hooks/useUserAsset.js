// hooks/useUserAssets.js
import { useEffect, useState } from "react";
import { fetchUserAssetsFromPending, fetchLibrary } from "@/config/firebase";

export function useUserAssets(uid) {
    const [assets, setAssets] = useState({ images: [], texts: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) return;
        (async () => {
            setLoading(true);
            try {
                // Library bevorzugen, sonst Fallback Pending
                const lib = await fetchLibrary(uid).catch(() => null);
                if (lib && (lib.images.length || lib.texts.length)) setAssets(lib);
                else setAssets(await fetchUserAssetsFromPending(uid, 200));
            } finally {
                setLoading(false);
            }
        })();
    }, [uid]);

    return { ...assets, loading };
}
