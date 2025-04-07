// handleFileUpload.js

import { uploadFileToTempFolder } from "@/config/firebase";
import { analyzeImage } from "@/functions/analyzeImage";
import { analyzePdf } from "@/functions/analyzePdf";
import { GraphicUploadModalContent } from "@/components/modalContent";
import PdfPreview from "@/components/pdfPreview";

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

        setUploading(true);
        setShowSpinner(true); // Show spinner when uploading starts

        try {
            const userId = purchaseData?.userId || "anonymous";
            const fileMetadata = await uploadFileToTempFolder(newFile, userId);

            if (newFile.type === "image/jpeg" || newFile.type === "image/png") {
                const analysisResult = await analyzeImage(newFile);
                if (analysisResult) {
                    setColorSpace(analysisResult.colorSpace);
                    setDpi(analysisResult.dpi);
                }

                setPurchaseData((prevData) => ({
                    ...prevData,
                    sides: {
                        ...prevData.sides,
                        [currentSide]: {
                            ...prevData.sides[currentSide],
                            uploadedGraphic: fileMetadata,
                            uploadedGraphicFile: newFile,
                        },
                    },
                }));

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
            } else if (newFile.type === "application/pdf") {
                // Handle multi-page PDF analysis

                const pdfAnalysisResult = await analyzePdf(newFile);

                setPurchaseData({
                    ...purchaseData,
                    sides: {
                        ...purchaseData.sides,
                        [currentSide]: {
                            ...purchaseData.sides[currentSide],
                            uploadedGraphic: fileMetadata,
                            uploadedGraphicFile: newFile,
                            isPDF: true,
                            preview: pdfAnalysisResult.previewImage,
                        },
                    },
                });
                setModalContent(
                    <GraphicUploadModalContent
                        file={newFile}
                        preview={pdfAnalysisResult.previewImage}
                        numPages={pdfAnalysisResult.numPages}
                        previewComponent={<PdfPreview file={newFile} />}
                        onNewFileUpload={handleNewFileUpload} // Pass the function here
                        steps={steps}
                        setCurrentStep={setCurrentStep}
                        currentStep={currentStep} // Pass the function here
                        setModalOpen={setModalOpen} // Pass the modal control function
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
