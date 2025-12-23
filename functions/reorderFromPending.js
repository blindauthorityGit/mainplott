// libs/reorder-from-pending.js
import { v4 as uuidv4 } from "uuid";

const FINISH_KEYS = ["frontveredelung", "frontVeredelung", "front", "backveredelung", "backVeredelung", "back"];
const isFinish = (k) => FINISH_KEYS.includes((k || "").toLowerCase());

export function mapSnapshotSideToCartSide(sSide) {
    if (!sSide) return { uploadedGraphics: [], texts: [] };

    const uploadedGraphics = (sSide.images || [])
        .filter((img) => img?.type === "upload" && img?.url)
        .map((img) => ({
            id: img.id || `u_${Math.random().toString(36).slice(2)}`,
            name: img.name || null,
            downloadURL: img.url,
            x: img.x ?? img.position?.x ?? 300,
            y: img.y ?? img.position?.y ?? 200,
            scale: img.scale ?? img.s ?? 1,
            rotation: img.rotation ?? img.r ?? 0,
        }));

    const texts = (sSide.texts || []).map((t) => ({
        id: t.id || `t_${Math.random().toString(36).slice(2)}`,
        value: t.value || "",
        fontFamily: t.fontFamily || "Roboto",
        fontSize: t.fontSize ?? 36,
        fill: t.fill || "#000000",
        letterSpacing: t.letterSpacing ?? 0,
        lineHeight: t.lineHeight ?? 1,
        x: t.x ?? 300,
        y: t.y ?? 200,
        scale: t.scale ?? 1,
        rotation: t.rotation ?? 0,
    }));

    return { uploadedGraphics, texts };
}

export function splitVariants(variantsIn = {}) {
    const sizes = {};
    let qty = 0;
    let subtotal = 0;

    Object.entries(variantsIn).forEach(([k, v]) => {
        if (isFinish(k)) return;
        const q = Number(v?.quantity || 0);
        const p = Number(v?.price || 0);
        sizes[k] = { id: v?.id || null, quantity: q, price: p };
        qty += q;
        subtotal += q * p;
    });

    const fv = variantsIn.frontVeredelung || variantsIn.frontveredelung || variantsIn.front || {};
    const bv = variantsIn.backVeredelung || variantsIn.backveredelung || variantsIn.back || {};

    const veredelungenPerPiece = {
        front: Number(fv.price || 0),
        back: Number(bv.price || 0),
    };

    const veredelungTotal =
        Number(fv.quantity || 0) * veredelungenPerPiece.front + Number(bv.quantity || 0) * veredelungenPerPiece.back;

    return { sizes, qty, subtotal, veredelungenPerPiece, veredelungTotal };
}

/** Pending-Entry -> reguläre cartItems (ohne Shopify-Hydration) */
export function buildCartItemsFromPendingEntry(entry) {
    const items = entry?.items || [];
    return items.map((it) => {
        const s = it?.snapshot || {};

        const frontPrev = (s?.sides?.front?.images || []).find((i) => i?.name === "designPreview")?.url || null;
        const backPrev = (s?.sides?.back?.images || []).find((i) => i?.name === "designPreview")?.url || null;

        const frontSide = mapSnapshotSideToCartSide(s?.sides?.front);
        const backSide = mapSnapshotSideToCartSide(s?.sides?.back);

        const {
            sizes: formattedVariants,
            qty,
            subtotal,
            veredelungenPerPiece,
            veredelungTotal,
        } = splitVariants(s?.variants || {});

        const computedTotal = subtotal + veredelungTotal;
        const totalPrice = Number(typeof s.totalPrice === "number" ? s.totalPrice : computedTotal);

        // "price" in deinem Normal-Flow scheint eher der Gesamtpreis oder der „Basispreis“ der aktuellen Konfig zu sein.
        // Damit Steps nichts auf 0 setzen, sorgen wir für sinnvolle Defaults:
        const price = totalPrice;

        return {
            id: it.id || uuidv4(),

            configurator: "config",
            decorationMode: "permSide",
            currentSide: "front",

            containerWidth: 676,
            containerHeight: 734,
            boundingRect: null,

            product: {
                handle: s.productHandle,
                title: s.productTitle || "Artikel",
                images: { edges: [] }, // wird in der Hydration befüllt
            },
            productName: s.productTitle || "Artikel",

            design: {
                front: frontPrev ? { downloadURL: frontPrev } : null,
                back: backPrev ? { downloadURL: backPrev } : null,
            },

            sides: { front: frontSide, back: backSide },

            selectedColor: s.selectedColor || null,
            selectedSize: s.selectedSize || null,

            variants: s.variants || {},
            formattedVariants,

            veredelungenPerPiece,
            veredelungTotal,

            quantity: qty || 1,
            totalPrice,
            price,

            islayout: false,
            personalisierung: null,
            profitDataCheck: 0,

            _snapshot: s,
            _src: "pending",
        };
    });
}
