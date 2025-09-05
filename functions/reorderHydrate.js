// libs/reorder-hydrate.js
//
// Du brauchst einen Fetcher, z.B. aus "@/libs/shopify":
// import { getProductByHandle } from "@/libs/shopify";
// und gibst ihn unten an hydrateCartItemsWithProduct als Argument.

function firstNonZeroSize(formattedVariants = {}) {
    const entry = Object.entries(formattedVariants).find(([, v]) => Number(v?.quantity || 0) > 0);
    return entry ? { size: entry[0], info: entry[1] } : null;
}

export async function hydrateCartItemsWithProduct(items, { fetchProductByHandle }) {
    const out = [];

    for (const item of items) {
        const handle = item?.product?.handle;
        if (!handle || !fetchProductByHandle) {
            out.push(item);
            continue;
        }

        try {
            const p = await fetchProductByHandle(handle); // ← muss { id, images, variants } etc. liefern
            const firstImg = p?.images?.[0]?.url || p?.images?.edges?.[0]?.node?.originalSrc || null;

            // selectedVariantId: nimm die Variante der ersten Größe mit Menge > 0 (falls vorhanden),
            // fallback: erste Shopify-Variante
            let selectedVariantId = null;

            const nonZero = firstNonZeroSize(item.formattedVariants);
            if (nonZero?.info?.id) {
                selectedVariantId = nonZero.info.id; // in deinen Snapshots sind das GIDs – perfekt
            } else {
                selectedVariantId = p?.variants?.[0]?.id || p?.variants?.edges?.[0]?.node?.id || null;
            }

            // backImage (Canvas-Hintergrund) – viele Steps erwarten das
            const backImage = item.backImage || firstImg || null;

            // Optional: "unitPrice" ableiten, wenn dein Step ihn liest.
            // Hier: einfacher Durchschnittspreis ohne Veredelung (falls du das brauchst, sonst so lassen).
            let unitPrice = null;
            const qtySum = Object.values(item.formattedVariants || {}).reduce(
                (a, v) => a + Number(v?.quantity || 0),
                0
            );
            if (qtySum > 0) {
                const baseSum = Object.values(item.formattedVariants || {}).reduce(
                    (s, v) => s + Number(v?.quantity || 0) * Number(v?.price || 0),
                    0
                );
                unitPrice = baseSum / qtySum;
            }

            out.push({
                ...item,
                product: {
                    ...(item.product || {}),
                    id: p?.id || item?.product?.id || null,
                    images: p?.images || item?.product?.images || { edges: [] },
                },
                backImage,
                selectedVariantId: selectedVariantId || item?.selectedVariantId || null,
                // Wenn dein Step "price" als Stückpreis interpretiert, und 0 anzeigen würde:
                price: item.price || unitPrice || item.totalPrice || 0,
            });
        } catch (e) {
            console.warn("[hydrate] failed for handle", handle, e);
            out.push(item); // Fallback: ungeändert
        }
    }

    return out;
}
