// functions/prepareLineItems.js

const MAX_TEXT = 240;

// Text darf gecappt werden, URLs NICHT (sonst sind Firebase-Links kaputt)
const capText = (s) => (s == null ? "" : String(s)).slice(0, MAX_TEXT);
const asUrl = (s) => (s == null ? "" : String(s));

// --- helpers -------------------------------------------------------

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

/**
 * Tries multiple known places where the final rendered / configured design could live.
 * Adjust priority/paths if needed.
 */
function resolveDesignUrl(item, side) {
    // Most likely (your screenshot indicates purchaseData.design.front.downloadURL)
    const direct =
        item?.design?.[side]?.downloadURL ||
        item?.design?.[side]?.url ||
        item?.design?.[side]?.downloadUrl ||
        item?.design?.[side]?.downloadURLNet;

    if (direct) return direct;

    // sometimes stored per side
    const fromSides =
        item?.sides?.[side]?.design?.downloadURL ||
        item?.sides?.[side]?.design?.url ||
        item?.sides?.[side]?.designDownloadURL ||
        item?.sides?.[side]?.downloadURL; // fallback if someone stored it directly

    return fromSides || null;
}

function collectSide(item, side) {
    const s = item?.sides?.[side] || {};

    // uploaded motif images (single or array)
    let images = [];
    if (Array.isArray(s.uploadedGraphics) && s.uploadedGraphics.length) {
        images = uniqueUploadUrls(s.uploadedGraphics);
    } else if (s.uploadedGraphic?.downloadURL || s.uploadedGraphic?.url) {
        images = uniqueUploadUrls([s.uploadedGraphic]);
    }

    const texts = Array.isArray(s.texts)
        ? s.texts.map((t) => ({
              value: t?.value || t?.text || "",
              fontFamily: t?.fontFamily || "",
              fill: t?.fill || "",
          }))
        : [];

    // ✅ final rendered design per side
    const designUrl = resolveDesignUrl(item, side);

    return { images, texts, designUrl };
}

/**
 * Writes attributes so it appears nicely in Shopify line item properties.
 * - uploadedGraphic_front / uploadedGraphic_back
 * - Design (per veredelung line, so it shows under that line item)
 * - texts: Front Text 1 / Back Text 1 ...
 */
function pushPretty(attrs, sideKey, payload) {
    // sideKey is "front" or "back"
    const sideLabel = sideKey === "front" ? "front" : "back";

    // 1) uploaded graphics
    payload.images.forEach((img, i) => {
        // match your desired naming style (can be changed)
        if (i === 0) {
            attrs.push({ key: `uploadedGraphic_${sideLabel}`, value: asUrl(img.url) });
        } else {
            attrs.push({ key: `uploadedGraphic_${sideLabel}_${i + 1}`, value: asUrl(img.url) });
        }
    });

    // 2) final design URL (this is the important bit)
    if (payload.designUrl) {
        // key exactly "Design" to match your screenshot
        attrs.push({ key: "Design", value: asUrl(payload.designUrl) });
    }

    // 3) texts (capped)
    payload.texts.forEach((t, i) => {
        const parts = [];
        if (t.value) parts.push(`"${t.value}"`);
        if (t.fontFamily) parts.push(t.fontFamily);
        if (t.fill) parts.push(t.fill);

        if (parts.length) {
            const k = sideKey === "front" ? `Front Text ${i + 1}` : `Back Text ${i + 1}`;
            attrs.push({ key: k, value: capText(parts.join(", ")) });
        }
    });
}

// --- main ----------------------------------------------------------

export default function prepareLineItems(cartItems) {
    const lines = [];

    (cartItems || []).forEach((item, itemIndex) => {
        const { configurator, personalisierungsText, product } = item;

        // never mutate what's in the cart item
        const variants = { ...(item.variants || {}) };

        const isAllInclusive =
            Boolean(product?.preisModell?.value) && product.preisModell.value.includes("Alles inklusive");

        // derive per-side payload + motif counts
        const frontPayload = collectSide(item, "front");
        const backPayload = collectSide(item, "back");

        const countFront = frontPayload.images.length + frontPayload.texts.length;
        const countBack = backPayload.images.length + backPayload.texts.length;

        // base veredelung per side = 1 if there's at least one motif OR a final design exists
        const baseFront = countFront > 0 || Boolean(frontPayload.designUrl) ? 1 : 0;
        const baseBack = countBack > 0 || Boolean(backPayload.designUrl) ? 1 : 0;

        // --- 1) push SIZE (and other non-veredelung) variants as-is ---
        Object.entries(variants).forEach(([key, v]) => {
            if (!v?.id || Number(v.quantity) <= 0) return;
            if (/veredelung/i.test(key)) return; // handle decorations later
            if (key === "layoutService" || key === "profiDatenCheck") return;

            const attrs = [
                { key: "price", value: Number(v.price || 0).toFixed(2) },
                { key: "itemIndex", value: String(itemIndex) },
                { key: "title", value: v.size ? `Variante ${v.size}` : "Variante" },
            ];

            // If all-inclusive, attach everything to the base product line
            if (isAllInclusive) {
                pushPretty(attrs, "front", frontPayload);
                pushPretty(attrs, "back", backPayload);
            }

            if (personalisierungsText) {
                attrs.push({ key: "Personalisierung", value: capText(personalisierungsText) });
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
                { key: "frontVeredelung", side: "front", baseQty: baseFront, payload: frontPayload },
                { key: "backVeredelung", side: "back", baseQty: baseBack, payload: backPayload },
            ];

            decoSides.forEach(({ key, side, baseQty, payload }) => {
                if (!baseQty) return; // nothing on this side
                const v = variants[key];
                if (!v?.id) return; // safety

                const attrs = [
                    { key: "price", value: Number(v.price || 0).toFixed(2) },
                    { key: "itemIndex", value: String(itemIndex) },
                    { key: "title", value: `Veredelung ${side}` },
                    { key: "Platzierung", value: configurator !== "template" ? "Freie Platzierung" : "Fixe Position" },
                ];

                // Attach side-specific stuff (uploads + Design URL)
                pushPretty(attrs, side, payload);

                if (personalisierungsText) {
                    attrs.push({ key: "Personalisierung", value: capText(personalisierungsText) });
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

                if (frontExtra > 0) pushPretty(attrs, "front", frontPayload);
                if (backExtra > 0) pushPretty(attrs, "back", backPayload);

                lines.push({
                    variantId: extraVariantId,
                    quantity: totalExtra,
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

    console.log("LINES", lines);
    return lines;
}
