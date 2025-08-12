// functions/uploadGraphic.js
import { v4 as uuidv4 } from "uuid";
import { uploadFileToTempFolder } from "@/config/firebase";
import { analyzeImage } from "@/functions/analyzeImage";
import { analyzePdf } from "@/functions/analyzePdf";
import { GraphicUploadModalContent } from "@/components/modalContent";
import PdfPreview from "@/components/pdfPreview";
import getImagePlacement, { getFixedImagePlacement } from "@/functions/getImagePlacement";
import dataURLToBlob from "@/functions/dataURLToBlob";
import { saveGraphicToDB } from "@/indexedDB/graphics";

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

        // Diese Variable halten wir für Konva bereit:
        // - bei Images: original File
        // - bei PDFs: Preview-Blob als File
        let konvaRenderableFile = newFile;

        if (newFile.type.startsWith("image/")) {
            imgType = "image";

            // Maße aus dem lokalen File (kein CORS)
            const img = new window.Image();
            img.src = URL.createObjectURL(newFile);
            await new Promise((res) => (img.onload = res));
            width = img.width;
            height = img.height;

            // Analyse
            analysisResult = await analyzeImage(newFile);
            setColorSpace?.(analysisResult.colorSpace);
            setDpi?.(analysisResult.dpi);
        } else if (newFile.type === "application/pdf") {
            imgType = "pdf";

            // PDF analysieren -> previewImage (DataURL oder URL) + numPages etc.
            analysisResult = await analyzePdf(newFile);

            // Preview in einen Blob/File verwandeln, damit Konva lokal rendert (kein CORS)
            let previewBlob;
            const src = analysisResult.previewImage;

            if (src.startsWith("data:")) {
                previewBlob = dataURLToBlob(src);
            } else {
                // Falls die Analyse ein remote-URL liefert, hole sie als Blob
                const resp = await fetch(src, { mode: "cors" }); // i.d.R. erlaubt; landet trotzdem lokal als Blob
                previewBlob = await resp.blob();
            }

            // Als File "verpacken", damit dein useImageObjects sauber arbeitet
            konvaRenderableFile = new File([previewBlob], `${newFile.name.replace(/\.pdf$/i, "")}-preview.png`, {
                type: previewBlob.type || "image/png",
            });

            // Dimensionen für Placement aus dem Preview ermitteln
            const tmpImg = new window.Image();
            tmpImg.src = URL.createObjectURL(konvaRenderableFile);
            await new Promise((res) => (tmpImg.onload = res));
            width = tmpImg.width;
            height = tmpImg.height;
        }

        // =============== PLACEMENT-BERECHNUNG ===============
        let placement;
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
                boundingRect = { x, y, width: widthBox, height: heightBox };
            } catch (e) {
                // ignore
            }
        }

        if (width && height) {
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
            // Fallback
            placement = { x: 100, y: 100, scale: 1, finalWidth: 100, finalHeight: 100 };
        }

        const centeredX = printRect.x + printRect.width / 2;
        const centeredY = printRect.y + printRect.height / 2;

        // Grafik-Objekt fürs Array
        const newGraphic = {
            id: uuidv4(),
            // Wichtig: für Konva immer ein lokales File/Blob
            file: konvaRenderableFile,
            // Optional weiterhin Metadaten der Original-Upload-URL etc.
            ...fileMetadata,
            originalFileType: newFile.type,
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
                // Für UI/Modals kannst du trotzdem die Preview weiterreichen (wir rendern sie dort ebenfalls lokal)
                preview:
                    konvaRenderableFile instanceof File
                        ? URL.createObjectURL(konvaRenderableFile)
                        : analysisResult.previewImage,
            }),
        };

        try {
            await saveGraphicToDB({
                name: newFile.name,
                fileOrBlob: newFile,
                preview: analysisResult?.previewImage || null, // dataURL bei PDFs? passt
                isPDF: imgType === "pdf",
                userId: purchaseData?.userId || "anonymous",
            });
        } catch (e) {
            console.warn("IndexedDB cache save failed:", e);
        }

        // --- 2. In Array pushen ---
        setPurchaseData((prev) => {
            const prevSide = prev.sides?.[currentSide] || {};
            const prevGraphics = prevSide.uploadedGraphics || [];
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
                        uploadedGraphicFile: newFile, // Original-Upload (nur zur Info/Auswertung)
                    },
                },
            };
        });

        setUploading?.(false);
        setShowSpinner?.(false);

        // --- 3. ModalContent (Preview lokal anzeigen) ---
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
                        uploadAllGraphics({
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
            const modalPreview =
                konvaRenderableFile instanceof File
                    ? URL.createObjectURL(konvaRenderableFile)
                    : analysisResult.previewImage;

            setModalContent?.(
                <GraphicUploadModalContent
                    file={newFile}
                    preview={modalPreview}
                    numPages={analysisResult.numPages}
                    steps={steps}
                    setModalOpen={setModalOpen}
                    previewComponent={<PdfPreview file={newFile} />}
                    onNewFileUpload={(file) =>
                        uploadAllGraphics({
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
