// handleMultiFileUpload.js
import { v4 as uuidv4 } from "uuid";
import handleFileUpload from "@/functions/handleFileUpload"; // deine bestehende Funktion für Einzel-Upload

export default async function handleAddGraphicToArray({
    newFile,
    currentSide,
    purchaseData,
    setPurchaseData,
    setModalOpen,
    setShowSpinner,
    setModalContent,
    setUploading,
    setUploadError,
    setColorSpace,
    setDpi,
    steps,
    currentStep,
    setCurrentStep,
    stepAhead,
    // optional: callback, damit du zB im KonvaLayer Previews rendern kannst
}) {
    // Erst Upload und Datencheck wie im Original
    let uploadMeta;
    console.log("STEPAEHAD", stepAhead);
    try {
        uploadMeta = await handleFileUpload({
            newFile,
            currentSide,
            purchaseData,
            setUploadedFile: () => {},
            setPurchaseData,
            setModalOpen,
            setShowSpinner,
            setModalContent,
            setUploading,
            setUploadError,
            setColorSpace,
            setDpi,
            steps,
            currentStep,
            setCurrentStep,
            stepAhead,
        });
    } catch (e) {
        setUploadError && setUploadError("Upload fehlgeschlagen");
        throw e;
    }

    console.log("UPLOADMETA", uploadMeta);

    // Danach Grafik-Objekt erzeugen (UUID, alle Meta-Daten)
    // Tipp: hole Bildmaße!
    let width = null,
        height = null,
        imgType = "image";
    if (newFile.type.startsWith("image/")) {
        const img = new window.Image();
        img.src = URL.createObjectURL(newFile);
        await new Promise((res) => {
            img.onload = res;
        });
        width = img.width;
        height = img.height;
    } else if (newFile.type === "application/pdf") {
        imgType = "pdf";
        // Optional: Preview/Meta extrahieren
    }

    const newGraphic = {
        id: uuidv4(),
        file: newFile,
        ...uploadMeta, // hier downloadURL etc.
        width,
        height,
        xPosition: 100, // oder per helper initial platzieren
        yPosition: 100,
        scale: 1,
        rotation: 0,
        type: imgType,
        isActive: true,
    };

    // In den Store pushen
    setPurchaseData((prev) => {
        const prevGraphics = prev.sides[currentSide]?.uploadedGraphics || [];
        // Alles andere auf inactive setzen:
        const updatedGraphics = prevGraphics.map((g) => ({ ...g, isActive: false }));
        return {
            ...prev,
            sides: {
                ...prev.sides,
                [currentSide]: {
                    ...prev.sides[currentSide],
                    uploadedGraphics: [...updatedGraphics, newGraphic],
                    activeGraphicId: newGraphic.id,
                },
            },
        };
    });

    console.log(purchaseData);

    // Optional: callback(newGraphic);
}
