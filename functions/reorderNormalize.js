// libs/reorder-normalize.js
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { nanoid } from "nanoid";

/** --- Pending aus Firestore laden --- */
export async function loadPending(id, uid) {
    const ref = doc(db, `users/${uid}/pending/${id}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Pending-Order nicht gefunden");
    return snap.data(); // { items:[{ snapshot, ... }], ... }
}

/** --- Pending → cartItems (für deinen CartSidebar) --- */
export function normalizePendingToCartItems(pending) {
    const items = pending?.items || [];
    return items.map((it, index) => {
        const s = it?.snapshot || {};
        const frontPrev = s?.sides?.front?.images?.find((i) => i?.name === "designPreview")?.url || null;
        const backPrev = s?.sides?.back?.images?.find((i) => i?.name === "designPreview")?.url || null;

        // Deine CartSidebar nutzt:
        // - item.product.handle
        // - item.productName
        // - item.design.front/back.downloadURL
        // - item.variants (mit quantities/prices)
        // - item.totalPrice
        // - item.selectedColor/selectedSize (optional)
        return {
            id: nanoid(),
            productName: s.productTitle || "Artikel",
            product: {
                handle: s.productHandle,
                title: s.productTitle || "Artikel",
                images: { edges: [] },
            },
            design: {
                front: frontPrev ? { downloadURL: frontPrev } : null,
                back: backPrev ? { downloadURL: backPrev } : null,
            },
            selectedColor: s.selectedColor || null,
            selectedSize: s.selectedSize || null,
            variants: s.variants || {},
            totalPrice: Number(s.totalPrice || 0),
            // für Mengenanzeige, falls du die brauchst
            quantity: Object.values(s.variants || {}).reduce((a, v) => a + Number(v?.quantity || 0), 0) || 1,

            // Wenn du später tiefer editieren willst (Texte/Uploads-Placement etc.),
            // kannst du hier das Original mitgeben:
            _snapshot: s,
            _src: "pending",
            _index: index,
        };
    });
}

/** --- Shopify → cartItems: später ergänzen, wenn du Completed-Reorders willst --- */
export function normalizeShopifyToCartItems(shopifyOrder) {
    // TODO: falls du Completed aus Shopify reordern willst
    return [];
}
