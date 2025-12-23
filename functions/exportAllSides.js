import dataURLToBlob from "@/functions/dataURLToBlob";
import { uploadImageToStorage } from "@/config/firebase";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

const hasDesign = (side) =>
    !!side &&
    ((Array.isArray(side.uploadedGraphics) && side.uploadedGraphics.length > 0) ||
        (Array.isArray(side.texts) && side.texts.length > 0));

/**
 * Exportiert Front/Back nacheinander, sobald auf der Stage gerendert.
 * Erwartet, dass exportCanvasRef.current() dein handleExport aufruft.
 */
export default async function exportAllSides({
    purchaseData,
    setPurchaseData,
    exportCanvasRef,
    setConfiguredImage, // optional
    extraWaitMs = 250, // ggf. anpassen, wenn Back sehr spät rendert
}) {
    const results = {};

    async function exportSide(side) {
        // Seite umschalten
        setPurchaseData((prev) => ({ ...prev, currentSide: side }));

        // kurz warten, bis Konva wirklich die neue Seite gemalt hat
        await nextFrame(); // 1 Frame
        await nextFrame(); // 2 Frames
        if (extraWaitMs) await delay(extraWaitMs);

        if (!exportCanvasRef?.current) {
            throw new Error("exportCanvasRef.current ist nicht gesetzt.");
        }

        const dataURL = exportCanvasRef.current(); // nutzt dein handleExport
        const blob = dataURLToBlob(dataURL);
        const downloadURL = await uploadImageToStorage(blob, `${side}-${Date.now()}.png`);

        // im State ablegen
        setPurchaseData((prev) => ({
            ...prev,
            design: {
                ...prev.design,
                [side]: { data: dataURL, downloadURL },
            },
        }));

        results[side] = { dataURL, downloadURL };
        return results[side];
    }

    const frontHas = hasDesign(purchaseData?.sides?.front);
    const backHas = hasDesign(purchaseData?.sides?.back);

    if (frontHas) await exportSide("front");
    if (backHas) await exportSide("back");

    // Bild für die Zusammenfassung wählen (wie früher: Front bevorzugt)
    if (results.front?.downloadURL) {
        setConfiguredImage?.(results.front.downloadURL);
    } else if (results.back?.downloadURL) {
        setConfiguredImage?.(results.back.downloadURL);
    }

    return results;
}
