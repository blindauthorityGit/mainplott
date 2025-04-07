import { uploadFileToTempFolder } from "@/config/firebase"; // Firebase upload function
import { analyzeImage } from "@/functions/analyzeImage"; // Image analysis function
import { analyzePdf } from "@/functions/analyzePdf"; // PDF analysis function
import { GraphicUploadModalContent } from "@/components/modalContent"; // Modal content component
import PdfPreview from "@/components/pdfPreview"; // PDF preview component

/**
 * Handles file upload for the current side.
 * @param {File} newFile - The file to be uploaded.
 * @param {Object} purchaseData - The current purchase data object.
 * @param {Function} setPurchaseData - Zustand function to set the purchase data.
 * @param {Function} setShowSpinner - Zustand function to show or hide the spinner.
 * @param {Function} setModalContent - Zustand function to set the modal content.
 * @param {Function} setModalOpen - Zustand function to control modal visibility.
 * @param {string} currentSide - Current side being worked on ("front" or "back").
 * @param {Function} [setCurrentStep] - Function to set the current step (optional).
 * @param {Array} [steps] - Array of steps (optional).
 * @param {number} [currentStep] - Current step number (optional).
 */
export async function handleFileUpload({
    newFile,
    purchaseData,
    setPurchaseData,
    setShowSpinner,
    setModalContent,
    setModalOpen,
    currentSide,
    setCurrentStep,
    steps,
    currentStep,
}) {
    if (newFile) {
        setShowSpinner(true); // Show spinner when uploading starts

        try {
            // Check if we are in a local development environment
            const isLocalDev = Boolean(localStorage.getItem("env") === "true");
            let fileMetadata;

            if (isLocalDev) {
                // Save the file in local storage for development purposes
                const reader = new FileReader();
                reader.readAsDataURL(newFile);
                reader.onloadend = () => {
                    localStorage.setItem("uploadedGraphic", reader.result);
                    fileMetadata = {
                        fileId: "local-dev",
                        filePath: "local-dev",
                        downloadURL: reader.result,
                    };
                    updatePurchaseData(newFile, fileMetadata);
                };
            } else {
                // Upload the new file to Firebase temporary folder
                const userId = purchaseData?.userId || "anonymous";
                fileMetadata = await uploadFileToTempFolder(newFile, userId);
                updatePurchaseData(newFile, fileMetadata);
            }

            // Analyze the new file
            if (newFile.type === "image/jpeg" || newFile.type === "image/png") {
                const analysisResult = await analyzeImage(newFile);
                if (analysisResult) {
                    setModalContent(
                        <GraphicUploadModalContent
                            file={newFile}
                            dpi={analysisResult.dpi}
                            colorSpace={analysisResult.colorSpace}
                            alpha={analysisResult.alpha}
                            size={analysisResult.size}
                            format={analysisResult.format}
                            dimension={analysisResult.dimension}
                            onNewFileUpload={(newFile) =>
                                handleFileUpload({
                                    newFile,
                                    purchaseData,
                                    setPurchaseData,
                                    setShowSpinner,
                                    setModalContent,
                                    setModalOpen,
                                    currentSide,
                                    setCurrentStep,
                                    steps,
                                    currentStep,
                                })
                            }
                        />
                    );
                }
            } else if (newFile.type === "application/pdf") {
                // Handle multi-page PDF analysis
                const pdfAnalysisResult = await analyzePdf(newFile);
                setModalContent(
                    <GraphicUploadModalContent
                        file={newFile}
                        preview={pdfAnalysisResult.previewImage}
                        numPages={pdfAnalysisResult.numPages}
                        previewComponent={<PdfPreview file={newFile} />}
                        onNewFileUpload={(newFile) =>
                            handleFileUpload({
                                newFile,
                                purchaseData,
                                setPurchaseData,
                                setShowSpinner,
                                setModalContent,
                                setModalOpen,
                                currentSide,
                                setCurrentStep,
                                steps,
                                currentStep,
                            })
                        }
                    />
                );
            }

            // Open modal to show the uploaded details
            setModalOpen(true);
        } catch (error) {
            console.error("Error uploading new file:", error);
        } finally {
            setShowSpinner(false); // Hide spinner when uploading is complete
        }
    }

    function updatePurchaseData(file, metadata) {
        // Update the purchaseData for the current side
        setPurchaseData({
            ...purchaseData,
            sides: {
                ...purchaseData.sides,
                [currentSide]: {
                    ...purchaseData.sides[currentSide],
                    uploadedGraphic: metadata,
                    uploadedGraphicFile: file,
                },
            },
        });
    }
}
