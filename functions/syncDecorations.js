// functions/syncDecorations.js
// macht aus "liegt Content auf Seite?" -> Veredelungs-Linien (IDs, Preise, Menge)
// und schreibt sie in purchaseData. Erwartet dein "parsedVeredelungData" am Product.

function sideHasContent(sideObj) {
    if (!sideObj) return false;
    const hasImgs =
        (Array.isArray(sideObj.uploadedGraphics) && sideObj.uploadedGraphics.length > 0) || !!sideObj.uploadedGraphic; // alter Single-Upload-Fall
    const hasTexts = Array.isArray(sideObj.texts) && sideObj.texts.length > 0;
    return hasImgs || hasTexts;
}

function firstVariant(node) {
    // holt die erste Varianten-ID + Preis aus dem Shopify-Objekt
    const v = node?.variants?.edges?.[0]?.node;
    return {
        id: v?.id || null,
        price: Number(v?.price?.amount ?? node?.price ?? 0) || 0,
    };
}

export default function syncDecorations({ purchaseData, setPurchaseData, product }) {
    const sides = purchaseData?.sides || {};
    const hasFront = sideHasContent(sides.front);
    const hasBack = sideHasContent(sides.back);

    // Gesamtmenge aller Kleidungs-Varianten (XS..3XL etc.)
    const totalQty = Object.values(purchaseData?.variants || {})
        .filter((v) => typeof v?.quantity === "number" && v.quantity > 0)
        .reduce((s, v) => s + v.quantity, 0);

    // Shopify-Varianten für Veredelungs-Produkte aus deinem Produkt-Fetch
    const frontNode = product?.parsedVeredelungData?.front || null;
    const backNode = product?.parsedVeredelungData?.back || null;

    const frontVar = firstVariant(frontNode);
    const backVar = firstVariant(backNode);

    const newVariants = { ...(purchaseData.variants || {}) };

    // Front-Veredelung
    if (hasFront && frontVar.id) {
        newVariants.frontVeredelung = {
            id: frontVar.id,
            quantity: totalQty || 1,
            price: frontVar.price,
        };
    } else {
        delete newVariants.frontVeredelung;
    }

    // Back-Veredelung
    if (hasBack && backVar.id) {
        newVariants.backVeredelung = {
            id: backVar.id,
            quantity: totalQty || 1,
            price: backVar.price,
        };
    } else {
        delete newVariants.backVeredelung;
    }

    // Summen (optional, falls du sie an anderer Stelle nutzt)
    const veredelungPerPiece = {
        front: hasFront ? frontVar.price : 0,
        back: hasBack ? backVar.price : 0,
    };
    const veredelungTotal = (veredelungPerPiece.front + veredelungPerPiece.back) * (totalQty || 1);

    setPurchaseData((prev) => ({
        ...prev,
        variants: newVariants,
        veredelungen: { front: hasFront, back: hasBack },
        veredelungPerPiece,
        veredelungTotal,
    }));
}
