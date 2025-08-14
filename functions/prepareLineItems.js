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

    // NUR echte Uploads, KEIN Preview
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
        const { variants = {}, configurator, personalisierungsText, product } = item;
        const isAllInclusive =
            Boolean(product?.preisModell?.value) && product.preisModell.value.includes("Alles inklusive");

        // Inhalte je Seite ermitteln
        const frontPayload = collectSide(item, "front");
        const backPayload = collectSide(item, "back");

        // Wenn Seite Inhalte hat, aber die passende Veredelung fehlt → Menge = 1 setzen
        if ((frontPayload.images.length || frontPayload.texts.length) && variants.frontVeredelung?.id) {
            variants.frontVeredelung.quantity = Math.max(1, Number(variants.frontVeredelung.quantity || 0));
        }
        if ((backPayload.images.length || backPayload.texts.length) && variants.backVeredelung?.id) {
            variants.backVeredelung.quantity = Math.max(1, Number(variants.backVeredelung.quantity || 0));
        }

        // alle Varianten iterieren (inkl. Veredelungen)
        Object.entries(variants).forEach(([key, v]) => {
            if (!v?.id || Number(v.quantity) <= 0) return;
            if (key === "layoutService" || key === "profiDatenCheck") return;

            const isVeredelung = /veredelung/i.test(key);
            if (isVeredelung && isAllInclusive) return; // bei All-Inclusive keine extra Veredelung

            const attrs = [
                { key: "price", value: Number(v.price || 0).toFixed(2) },
                { key: "itemIndex", value: String(itemIndex) },
            ];

            if (isVeredelung) {
                const side = key.replace(/Veredelung/i, "").toLowerCase(); // "front" | "back"
                const sideLabel = side === "back" ? "Back" : "Front";
                attrs.push(
                    { key: "title", value: `Veredelung ${side}` },
                    { key: "Platzierung", value: configurator !== "template" ? "Freie Platzierung" : "Fixe Position" }
                );
                const payload = side === "back" ? backPayload : frontPayload;
                pushPretty(attrs, sideLabel, payload);
            } else {
                attrs.push({ key: "title", value: v.size ? `Variante ${v.size}` : "Variante" });

                // Bei All-Inclusive hängen wir Inhalte beider Seiten als kurze Info an
                if (isAllInclusive) {
                    pushPretty(attrs, "Front", frontPayload);
                    pushPretty(attrs, "Back", backPayload);
                }
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
    });

    return lines;
}
