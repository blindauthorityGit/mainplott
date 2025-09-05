// Wie möchten wir zählen?
// "perSide"  = pro Seite max. 1 Veredelung (egal wie viele Elemente)
// "perElement" = jedes Text- oder Grafik-Element zählt separat
export const DECORATION_MODE = (process.env.NEXT_PUBLIC_DECORATION_MODE || "perSide").toLowerCase(); // "perside" | "perelement"

// Hat eine Seite überhaupt Inhalt?
export function hasDecoration(side) {
    if (!side) return false;
    if (Array.isArray(side.uploadedGraphics) && side.uploadedGraphics.length) return true;
    if (side.uploadedGraphic || side.uploadedGraphicFile) return true; // legacy single upload
    if (Array.isArray(side.texts) && side.texts.some((t) => (t?.value || "").trim() !== "")) return true;
    return false;
}

// Wie viele Veredelungen auf einer Seite gemäss Modus?
export function countDecorationsForSide(side, mode = DECORATION_MODE) {
    if (!hasDecoration(side)) return 0;
    if (mode === "perside") return 1;

    // perElement:
    let count = 0;
    // Grafiken
    if (side.uploadedGraphic || side.uploadedGraphicFile) count += 1;
    if (Array.isArray(side.uploadedGraphics)) count += side.uploadedGraphics.length;

    // Texte (nur nicht-leere)
    if (Array.isArray(side.texts)) {
        count += side.texts.filter((t) => (t?.value || "").trim() !== "").length;
    }
    return count;
}

// Zusammenfassung/Batches bauen (für UI-Anzeige)
export function getDecorationSummary(pd, mode = DECORATION_MODE) {
    const f = countDecorationsForSide(pd?.sides?.front, mode);
    const b = countDecorationsForSide(pd?.sides?.back, mode);
    const text = [f ? `${f}× Front` : null, b ? `${b}× Rücken` : null].filter(Boolean).join(", ") || "Keine";
    const sidesWithContent = (f > 0 ? 1 : 0) + (b > 0 ? 1 : 0);
    return { front: f, back: b, text, sidesWithContent };
}
