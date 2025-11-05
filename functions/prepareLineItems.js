// functions/prepareLineItems.js

const MAX_VAL = 240;
const cap = (s) => (s == null ? "" : String(s)).slice(0, MAX_VAL);

function uniqueUploadUrls(arr) {
    const seen = new Set();
    const out = [];
    for (const g of arr || []) {
        const url = g?.downloadURL || g?.url || null;
        if (!url || seen.has(url)) continue;
        seen.add(url);
        out.push({ url });
    }
    return out;
}

function collectSide(item, side) {
    const s = item?.sides?.[side] || {};

    // only real uploads (no previews)
    let images = [];
    if (Array.isArray(s.uploadedGraphics) && s.uploadedGraphics.length) {
        images = uniqueUploadUrls(s.uploadedGraphics);
    } else if (s.uploadedGraphic?.downloadURL) {
        images = uniqueUploadUrls([s.uploadedGraphic]);
    }

    const texts = Array.isArray(s.texts)
        ? s.texts.map((t) => ({
              value: t?.value || t?.text || "",
              fontFamily: t?.fontFamily || "",
              fill: t?.fill || "",
          }))
        : [];

    return { images, texts };
}

function pushPretty(attrs, label, payload) {
    payload.images.forEach((img, i) => {
        attrs.push({ key: `${label} Image ${i + 1}`, value: cap(img.url) });
    });
    payload.texts.forEach((t, i) => {
        const parts = [];
        if (t.value) parts.push(`"${t.value}"`);
        if (t.fontFamily) parts.push(t.fontFamily);
        if (t.fill) parts.push(t.fill);
        if (parts.length) attrs.push({ key: `${label} Text ${i + 1}`, value: cap(parts.join(", ")) });
    });
}

export default function prepareLineItems(cartItems) {
    const lines = [];

    (cartItems || []).forEach((item, itemIndex) => {
        const { configurator, personalisierungsText, product } = item;

        // never mutate what's in the cart item
        const variants = { ...(item.variants || {}) };

        const isAllInclusive =
            Boolean(product?.preisModell?.value) && product.preisModell.value.includes("Alles inklusive");

        // --- derive per-side payload + motif counts ---
        const frontPayload = collectSide(item, "front");
        const backPayload = collectSide(item, "back");

        const countFront = frontPayload.images.length + frontPayload.texts.length;
        const countBack = backPayload.images.length + backPayload.texts.length;

        // base veredelung per side = 1 if there's at least one motif on that side
        const baseFront = countFront > 0 ? 1 : 0;
        const baseBack = countBack > 0 ? 1 : 0;

        // --- 1) push SIZE (and other non-veredelung) variants as-is ---
        Object.entries(variants).forEach(([key, v]) => {
            if (!v?.id || Number(v.quantity) <= 0) return;
            if (/veredelung/i.test(key)) return; // handle decorations in the next block
            if (key === "layoutService" || key === "profiDatenCheck") return;

            const attrs = [
                { key: "price", value: Number(v.price || 0).toFixed(2) },
                { key: "itemIndex", value: String(itemIndex) },
                { key: "title", value: v.size ? `Variante ${v.size}` : "Variante" },
            ];

            if (isAllInclusive) {
                pushPretty(attrs, "Front", frontPayload);
                pushPretty(attrs, "Back", backPayload);
            }
            if (personalisierungsText) {
                attrs.push({ key: "Personalisierung", value: cap(personalisierungsText) });
            }

            lines.push({
                variantId: v.id,
                quantity: Number(v.quantity || 1),
                customAttributes: attrs,
            });
        });

        if (!isAllInclusive) {
            // --- 2) push BASE veredelung per side (max 1 per side) ---
            const decoSides = [
                { key: "frontVeredelung", side: "front", label: "Front", baseQty: baseFront, payload: frontPayload },
                { key: "backVeredelung", side: "back", label: "Back", baseQty: baseBack, payload: backPayload },
            ];

            decoSides.forEach(({ key, side, label, baseQty, payload }) => {
                if (!baseQty) return; // nothing on this side
                const v = variants[key];
                if (!v?.id) return; // safety

                const attrs = [
                    { key: "price", value: Number(v.price || 0).toFixed(2) },
                    { key: "itemIndex", value: String(itemIndex) },
                    { key: "title", value: `Veredelung ${side}` },
                    { key: "Platzierung", value: configurator !== "template" ? "Freie Platzierung" : "Fixe Position" },
                ];
                pushPretty(attrs, label, payload);

                if (personalisierungsText) {
                    attrs.push({ key: "Personalisierung", value: cap(personalisierungsText) });
                }

                // FORCE quantity to exactly 1 for the base veredelung on that side
                lines.push({
                    variantId: v.id,
                    quantity: 1,
                    customAttributes: attrs,
                });
            });

            // --- 3) push ZUSATZ veredelungen (everything beyond the first per side) ---
            const extraVariantId =
                item.extraDecorationVariantId || item.extraDecorationVariantID || item.extraDecorationVariantIdNet;

            const frontExtra = Math.max(0, countFront - baseFront);
            const backExtra = Math.max(0, countBack - baseBack);
            const totalExtra = frontExtra + backExtra;

            if (extraVariantId && totalExtra > 0) {
                const attrs = [
                    { key: "title", value: "Zusatzveredelung" },
                    { key: "itemIndex", value: String(itemIndex) },
                    { key: "Front_extra", value: String(frontExtra) },
                    { key: "Back_extra", value: String(backExtra) },
                ];
                if (frontExtra > 0) pushPretty(attrs, "Front", frontPayload);
                if (backExtra > 0) pushPretty(attrs, "Back", backPayload);

                lines.push({
                    variantId: extraVariantId,
                    quantity: totalExtra, // 1 per additional motif
                    customAttributes: attrs,
                });
            } else if (totalExtra > 0 && !extraVariantId) {
                console.warn("[prepareLineItems] Missing extraDecorationVariantId; extras cannot be added.", {
                    frontExtra,
                    backExtra,
                    itemIndex,
                });
            }
        }
    });

    return lines;
}
