// handleFileUpload.js

import { uploadFileToTempFolder } from "@/config/firebase";
import { analyzeImage } from "@/functions/analyzeImage";
import { GraphicUploadModalContent } from "@/components/modalContent";

const handleFileUpload = async ({
    newFile,
    currentSide,
    purchaseData,
    setPurchaseData,
    setUploadedFile,
    setShowSpinner,
    setModalContent,
    setModalOpen,
    setUploading,
    setUploadError,
    setColorSpace,
    setDpi,
    steps,
}) => {
    if (newFile) {
        setUploadedFile(newFile);
        console.log(newFile, steps);
        setUploading(true);
        setShowSpinner(true); // Show spinner when uploading starts

        try {
            const userId = purchaseData?.userId || "anonymous";
            const fileMetadata = await uploadFileToTempFolder(newFile, userId);

            setPurchaseData({
                ...purchaseData,
                sides: {
                    ...purchaseData.sides,
                    [currentSide]: {
                        ...purchaseData.sides[currentSide],
                        uploadedGraphic: fileMetadata,
                        uploadedGraphicFile: newFile,
                    },
                },
            });

            if (newFile.type === "image/jpeg" || newFile.type === "image/png") {
                const analysisResult = await analyzeImage(newFile);
                if (analysisResult) {
                    setColorSpace(analysisResult.colorSpace);
                    setDpi(analysisResult.dpi);
                }
                console.log(analysisResult);

                setModalContent(
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
                            handleFileUpload({
                                newFile: file,
                                currentSide,
                                purchaseData,
                                setPurchaseData,
                                setUploadedFile,
                                setShowSpinner,
                                setModalContent,
                                setUploading,
                                setUploadError,
                                setColorSpace,
                                setDpi,
                            })
                        }
                    />
                );
            }
            setShowSpinner(false);
            setUploading(false);
            // Open modal
            setModalOpen(true);
        } catch (error) {
            console.error("Error uploading new file:", error);
            setUploadError("Fehler beim Hochladen der Datei. Bitte versuchen Sie es erneut.");
            setShowSpinner(false);
            setUploading(false);
        }
    }
};

export default handleFileUpload;
