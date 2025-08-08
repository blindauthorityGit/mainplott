// functions/uploadGraphic.js
import { v4 as uuidv4 } from "uuid";
import { uploadFileToTempFolder } from "@/config/firebase";
import { analyzeImage } from "@/functions/analyzeImage";
import { analyzePdf } from "@/functions/analyzePdf";
import { GraphicUploadModalContent } from "@/components/modalContent"; // Import the new modal content component
import PdfPreview from "@/components/pdfPreview";
import getImagePlacement, { getFixedImagePlacement } from "@/functions/getImagePlacement";

export default async function uploadAllGraphics({
    newFile,
    currentSide,
    purchaseData,
    setPurchaseData,
    setModalContent,
    setModalOpen,
    setShowSpinner,
    setUploading,
    setUploadError,
    setColorSpace,
    setDpi,
    steps,
    setCurrentStep,
    stepAhead,
}) {
    // --- 1. Validation ---
    const validFormats = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/postscript",
        "application/illustrator",
        "image/jp2",
        "image/tiff",
    ];
    const maxFileSize = 25 * 1024 * 1024;

    if (!validFormats.includes(newFile.type)) {
        setUploadError?.("Ungültiges Dateiformat. Bitte laden Sie eine JPG, PNG, PDF, EPS oder AI Datei hoch.");
        return;
    }
    if (newFile.size > maxFileSize) {
        setUploadError?.("Die Datei ist zu groß. Die maximale Dateigröße beträgt 25MB.");
        return;
    }
    setUploadError?.(null);

    setUploading?.(true);
    setShowSpinner?.(true);

    try {
        const userId = purchaseData?.userId || "anonymous";
        const fileMetadata = await uploadFileToTempFolder(newFile, userId);

        const printRect = purchaseData.boundingRect || {
            x: 0,
            y: 0,
            width: purchaseData.containerWidth,
            height: purchaseData.containerHeight,
        };

        let width = null,
            height = null,
            imgType = "image",
            analysisResult = {};

        if (newFile.type.startsWith("image/")) {
            imgType = "image";
            // Bildmaße holen
            const img = new window.Image();
            img.src = URL.createObjectURL(newFile);
            await new Promise((res) => (img.onload = res));
            width = img.width;
            height = img.height;
            // Analyse (z.B. für Modal-Content)
            analysisResult = await analyzeImage(newFile);
            setColorSpace?.(analysisResult.colorSpace);
            setDpi?.(analysisResult.dpi);
        } else if (newFile.type === "application/pdf") {
            imgType = "pdf";
            analysisResult = await analyzePdf(newFile);
            // Optional: width, height aus Preview holen (falls nötig)
        }

        // =============== PLACEMENT-BERECHNUNG ===============
        let placement;
        // Hole boundingRect, falls vorhanden (wie in deiner Konva-Komponente)
        let boundingRect = null;
        if (purchaseData?.product?.konfigBox && purchaseData.product.konfigBox.value) {
            try {
                const konfig = JSON.parse(purchaseData.product.konfigBox.value);
                const containerWidth = purchaseData.containerWidth;
                const containerHeight = purchaseData.containerHeight;
                const widthBox = konfig.width * containerWidth;
                const heightBox = konfig.height * containerHeight;
                const x = konfig.x != null ? konfig.x * containerWidth : (containerWidth - widthBox) / 2;
                const y = konfig.y != null ? konfig.y * containerHeight : (containerHeight - heightBox) / 2;
                // Du kannst auch hier addPadding nutzen, falls du es willst.
                boundingRect = { x, y, width: widthBox, height: heightBox };
            } catch (e) {
                // Fallback falls Fehler
            }
        }

        if (imgType === "image" && width && height) {
            if (boundingRect) {
                placement = getFixedImagePlacement({
                    imageNaturalWidth: width,
                    imageNaturalHeight: height,
                    boundingRect,
                    centerImage: true,
                });
            } else {
                placement = getImagePlacement({
                    containerWidth: purchaseData.containerWidth,
                    containerHeight: purchaseData.containerHeight,
                    imageNaturalWidth: width,
                    imageNaturalHeight: height,
                });
            }
        } else {
            // PDFs und andere, ohne Platzierung, Standardwerte nehmen
            placement = {
                x: 100,
                y: 100,
                scale: 1,
            };
        }

        const centeredX = printRect.x + printRect.width / 2;
        const centeredY = printRect.y + printRect.height / 2;

        console.log(placement);

        // Grafik-Objekt für Array
        const newGraphic = {
            id: uuidv4(),
            file: newFile,
            ...fileMetadata,
            width: placement.finalWidth,
            height: placement.finalHeight,
            xPosition: centeredX,
            yPosition: centeredY,
            scale: placement.scale ?? 1,
            rotation: 0,
            type: imgType,
            isActive: true,
            ...(imgType === "pdf" && {
                isPDF: true,
                preview: analysisResult.previewImage,
            }),
        };

        // --- 2. In Array pushen ---
        setPurchaseData((prev) => {
            const prevSide = prev.sides?.[currentSide] || {};
            const prevGraphics = prevSide.uploadedGraphics || [];
            // Alle vorherigen auf inactive setzen
            const updatedGraphics = prevGraphics.map((g) => ({ ...g, isActive: false }));
            return {
                ...prev,
                sides: {
                    ...prev.sides,
                    [currentSide]: {
                        ...prevSide,
                        uploadedGraphics: [...updatedGraphics, newGraphic],
                        activeGraphicId: newGraphic.id,
                        uploadedGraphic: fileMetadata,
                        uploadedGraphicFile: newFile,
                    },
                },
            };
        });

        setUploading?.(false);
        setShowSpinner?.(false);

        // --- 3. ModalContent setzen, wenn gewünscht ---
        if (imgType === "image") {
            setModalContent?.(
                <GraphicUploadModalContent
                    file={newFile}
                    dpi={analysisResult.dpi}
                    colorSpace={analysisResult.colorSpace}
                    alpha={analysisResult.alpha}
                    size={analysisResult.size}
                    format={analysisResult.format}
                    dimension={analysisResult.dimension}
                    steps={steps}
                    setModalOpen={setModalOpen}
                    onNewFileUpload={(file) =>
                        uploadGraphicToArray({
                            newFile: file,
                            currentSide,
                            purchaseData,
                            setPurchaseData,
                            setModalContent,
                            setModalOpen,
                            setShowSpinner,
                            setUploading,
                            setUploadError,
                            setColorSpace,
                            setDpi,
                            steps,
                            setCurrentStep,
                            stepAhead,
                        })
                    }
                />
            );
        } else if (imgType === "pdf") {
            setModalContent?.(
                <GraphicUploadModalContent
                    file={newFile}
                    preview={analysisResult.previewImage}
                    numPages={analysisResult.numPages}
                    previewComponent={<PdfPreview file={newFile} />}
                    onNewFileUpload={(file) =>
                        uploadGraphicToArray({
                            newFile: file,
                            currentSide,
                            purchaseData,
                            setPurchaseData,
                            setModalContent,
                            setModalOpen,
                            setShowSpinner,
                            setUploading,
                            setUploadError,
                            setColorSpace,
                            setDpi,
                            steps,
                            setCurrentStep,
                            stepAhead,
                        })
                    }
                />
            );
        }

        setModalOpen?.(true);
    } catch (error) {
        console.error("Error uploading new file:", error);
        setUploadError?.("Fehler beim Hochladen der Datei. Bitte versuchen Sie es erneut.");
        setUploading?.(false);
        setShowSpinner?.(false);
    }
}
