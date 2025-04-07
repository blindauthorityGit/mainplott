import dataURLToBlob from "@/functions/dataURLToBlob";
import { uploadImageToStorage } from "@/config/firebase";

// This function will attempt to export both sides (front and back) if they have designs.
// It relies on the parent to:
// 1. Pass in `purchaseData` and `setPurchaseData` so it can switch sides and update state.
// 2. Pass in `setConfiguredImage` to set the configured image after exporting the front.
// 3. Pass in `exportCanvasRef`, which should be set to the `handleExport` function provided by KonvaLayer.
// `handleExport` should return a dataURL of the current canvas.

export default async function exportAllSides({ purchaseData, setPurchaseData, setConfiguredImage, exportCanvasRef }) {
    const frontHasDesign = !!purchaseData.sides.front.uploadedGraphicFile;
    const backHasDesign = !!purchaseData.sides.back.uploadedGraphicFile;

    // Helper function to switch side, wait, and then export
    async function exportSide(side) {
        // Switch current side
        setPurchaseData((prev) => ({ ...prev, currentSide: side }));
        // Give the UI some time to re-render with the correct side
        await new Promise((r) => setTimeout(r, 500));

        // Export current canvas
        const dataURL = exportCanvasRef.current();
        const blob = dataURLToBlob(dataURL);
        const downloadURL = await uploadImageToStorage(blob, `${side}-${Date.now()}.png`);

        // Store in purchaseData.design
        setPurchaseData((prev) => ({
            ...prev,
            design: {
                ...prev.design,
                [side]: { data: dataURL, downloadURL },
            },
        }));
        if (side == "front") {
            setConfiguredImage(downloadURL);
        }

        return { dataURL, downloadURL };
    }

    // Export front if needed
    if (frontHasDesign) {
        await exportSide("front");
    }

    // Export back if needed
    if (backHasDesign) {
        await exportSide("back");
    }

    // If front was exported, set configuredImage from front design
    // if (frontHasDesign && purchaseData.design && purchaseData.design.front) {
    //     setConfiguredImage(purchaseData.design.front.data);
    // }
}
