// utils/decorations.js

export const DECORATION_MODE = {
    PER_SIDE: "perSide", // 1x pro Seite, sobald mind. Text ODER Grafik vorhanden
    PER_ELEMENT: "perElement", // später: pro Text/Grafik separat berechnen
};

// Wie viele Elemente hat eine Seite?
function countElementsOnSide(side) {
    if (!side) return 0;

    // Alt (single) vs. Neu (multi) – nicht doppelt zählen:
    const singleUpload = side.uploadedGraphic || side.uploadedGraphicFile ? 1 : 0;
    const multiUpload = Array.isArray(side.uploadedGraphics) ? side.uploadedGraphics.length : 0;
    const imageCount = Math.max(singleUpload, multiUpload);

    const textCount = Array.isArray(side.texts) ? side.texts.length : 0;

    return imageCount + textCount;
}

// Wieviel „Einheiten“ sollen berechnet werden?
function chargeUnitsForSide(side, mode) {
    const n = countElementsOnSide(side);
    if (mode === DECORATION_MODE.PER_ELEMENT) return n; // 0..n
    return n > 0 ? 1 : 0; // pro Seite
}

/**
 * Baut für front/back die Veredelungs-Varianten.
 * - Rabatte anhand totalQuantity (Staffel) wie gehabt
 * - Menge: totalQuantity * units (units abhängig von Modus)
 */
export function buildDecorationPatch({
    sides,
    veredelungen,
    totalQuantity,
    mode = DECORATION_MODE.PER_SIDE,
    calculateNetPrice,
}) {
    const patch = {};
    const perPiece = { front: 0, back: 0 };

    ["front", "back"].forEach((sideKey) => {
        const side = sides?.[sideKey];
        const units = chargeUnitsForSide(side, mode);
        if (!units) return;

        const ve = veredelungen?.[sideKey];
        if (!ve?.preisReduktion?.discounts?.length || !ve?.variants?.edges?.length) return;

        // Staffel nach totalQuantity
        const match = ve.preisReduktion.discounts.find(
            (d) =>
                totalQuantity >= Number(d.minQuantity) &&
                (d.maxQuantity == null || totalQuantity <= Number(d.maxQuantity))
        );
        if (!match) return;

        const idx = ve.preisReduktion.discounts.indexOf(match);
        const sel = ve.variants.edges[idx];
        if (!sel?.node?.id) return;

        const unitNet = calculateNetPrice ? calculateNetPrice(parseFloat(match.price)) : Number(match.price);

        perPiece[sideKey] = unitNet;

        patch[`${sideKey}Veredelung`] = {
            id: sel.node.id,
            size: null,
            quantity: totalQuantity * units, // PER_SIDE: *1, PER_ELEMENT: *#Elements
            price: unitNet,
            title: `${ve.title} ${sideKey === "front" ? "Front" : "Back"}`,
            currency: ve.currency,
            side: sideKey,
            units,
        };
    });

    const totalPerAll = totalQuantity * (perPiece.front + perPiece.back);
    return { patch, perPiece, totalPerAll };
}
