import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import ContentWrapper from "../components/contentWrapper";
import { uploadFileToTempFolder } from "@/config/firebase"; // Import the upload function from your firebase configuration
import { analyzeImage } from "@/functions/analyzeImage"; // Import the analyzeImage function
import { analyzePdf } from "@/functions/analyzePdf"; // Import the analyzePdf function
import PdfPreview from "@/components/pdfPreview";
import { P } from "@/components/typography";
import { FiTrash2, FiInfo, FiRefreshCw } from "react-icons/fi"; // Importing the trash, info, and refresh icons

import { GraphicUploadModalContent } from "@/components/modalContent"; // Import the new modal content component
import LoadingSpinner from "@/components/spinner"; // Import the loading spinner component

// STORE
import useStore from "@/store/store"; // Your Zustand store

export default function UploadGraphic({ product, setCurrentStep, steps, currentStep }) {
    const {
        purchaseData,
        setPurchaseData,
        setModalOpen,
        setModalContent,
        colorSpace,
        dpi,
        setColorSpace,
        setDpi,
        showSpinner,
        setShowSpinner,
    } = useStore();
    const [uploadedFile, setUploadedFile] = useState(purchaseData?.uploadedGraphicFile || null);
    const [uploading, setUploading] = useState(true);
    const [uploadError, setUploadError] = useState(null);

    const stepData = {
        title: "Grafik hochladen",
        // description: "Ziehen Sie Ihre Grafik hierher oder klicken Sie unten, um eine Datei hochzuladen.",
    };

    useEffect(() => {
        console.log(purchaseData, purchaseData?.uploadedGraphicFile);
        console.log(uploadedFile);
    }, [uploadedFile]);

    // Function to handle new file upload, similar to the initial file drop
    const handleNewFileUpload = async (newFile) => {
        if (newFile) {
            console.log(newFile);
            setUploadedFile(newFile);
            setUploading(true);
            setShowSpinner(true); // Show spinner when uploading starts

            try {
                // Upload the new file to Firebase temporary folder
                const userId = purchaseData?.userId || "anonymous"; // Replace with real user ID if available
                const fileMetadata = await uploadFileToTempFolder(newFile, userId);
                setPurchaseData({ ...purchaseData, uploadedGraphic: fileMetadata });

                // Analyze the new file
                if (newFile.type === "image/jpeg" || newFile.type === "image/png") {
                    const analysisResult = await analyzeImage(newFile);
                    if (analysisResult) {
                        setColorSpace(analysisResult.colorSpace);
                        setDpi(analysisResult.dpi);
                        console.log("Color Space:", analysisResult.colorSpace);
                        console.log("DPI:", analysisResult.dpi);
                    }
                    // Set the updated modal content with the new analysis
                    setModalContent(
                        <GraphicUploadModalContent
                            file={newFile}
                            dpi={analysisResult.dpi}
                            colorSpace={analysisResult.colorSpace}
                            alpha={analysisResult.alpha}
                            size={analysisResult.size}
                            format={analysisResult.format}
                            dimension={analysisResult.dimension}
                            onNewFileUpload={handleNewFileUpload} // Pass the function here
                            // Pass the function here
                        />
                    );
                }
                setShowSpinner(false);
                setUploading(false);
            } catch (error) {
                console.error("Error uploading new file:", error);
                setUploadError("Fehler beim Hochladen der Datei. Bitte versuchen Sie es erneut.");
                setShowSpinner(false);
                setUploading(false);
            }
        }
    };

    // Handle file drop
    const onDrop = useCallback(
        async (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                const validFormats = [
                    "image/jpeg",
                    "image/png",
                    "application/pdf",
                    "application/postscript",
                    "application/illustrator",
                    "image/jp2", // JPEG 2000 (JPF)
                    "image/tiff", // TIFF
                ];
                const maxFileSize = 10 * 1024 * 1024; // 10MB

                // Check file type
                if (!validFormats.includes(file.type)) {
                    setUploadError(
                        "Ungültiges Dateiformat. Bitte laden Sie eine JPG, PNG, PDF, EPS oder AI Datei hoch."
                    );
                    return;
                }

                // Check file size
                if (file.size > maxFileSize) {
                    setUploadError("Die Datei ist zu groß. Die maximale Dateigröße beträgt 10MB.");
                    return;
                }
                console.log(file);

                setUploadError(null); // Clear any previous errors
                setUploadedFile(file);
                setUploading(true);
                setShowSpinner(true); // Show spinner when uploading starts

                try {
                    // Upload the file to Firebase temporary folder
                    const userId = purchaseData?.userId || "anonymous"; // Replace with real user ID if available
                    const fileMetadata = await uploadFileToTempFolder(file, userId);
                    // Save metadata to the store
                    setPurchaseData({ ...purchaseData, uploadedGraphic: fileMetadata, uploadedGraphicFile: file });
                    console.log(fileMetadata);
                    // Determine what kind of analysis is needed based on file type
                    if (file.type === "image/jpeg" || file.type === "image/png") {
                        // Analyze JPEG or PNG with sharp
                        const analysisResult = await analyzeImage(file);
                        if (analysisResult) {
                            console.log(analysisResult);
                            setColorSpace(analysisResult.colorSpace);
                            setDpi(analysisResult.dpi);
                            console.log("Color Space:", analysisResult.colorSpace);
                            console.log("DPI:", analysisResult.dpi);
                            console.log("SIZE:", analysisResult.size);
                        }
                        setModalContent(
                            <GraphicUploadModalContent
                                file={file}
                                dpi={analysisResult.dpi}
                                colorSpace={analysisResult.colorSpace}
                                alpha={analysisResult.alpha}
                                size={analysisResult.size}
                                format={analysisResult.format}
                                dimension={analysisResult.dimension}
                                onNewFileUpload={handleNewFileUpload}
                                setCurrentStep={setCurrentStep}
                                setModalOpen={setModalOpen} // Pass the modal control function
                                steps={steps}
                                currentStep={currentStep} // Pass the function here
                            />
                        );
                    } else if (file.type === "application/pdf") {
                        // Handle multi-page PDF analysis
                        console.log("PDF file detected. Extracting and analyzing the first page...");
                        const pdfAnalysisResult = await analyzePdf(file);
                        console.log("PDF Analysis:", pdfAnalysisResult);
                        setModalContent(
                            <GraphicUploadModalContent
                                file={file}
                                preview={pdfAnalysisResult.previewImage}
                                numPages={pdfAnalysisResult.numPages}
                                previewComponent={<PdfPreview file={file} />}
                                onNewFileUpload={handleNewFileUpload} // Pass the function here
                            />
                        );

                        // Call a function to handle PDF (e.g., extract metadata or convert to image)
                        // You might want to create an analyzePDF(file) function for this purpose
                    } else if (file.type === "application/postscript" || file.type === "application/illustrator") {
                        // Handle EPS or AI file
                        console.log("EPS or AI file detected. Converting and analyzing...");
                        // You might want to create an analyzeVectorFile(file) function for this purpose
                        // Convert the vector file to an image using ImageMagick, then analyze with sharp if needed
                    }

                    // Open modal
                    setModalOpen(true);
                    console.log("File uploaded successfully:", fileMetadata);
                    setShowSpinner(false); // Hide spinner when uploading is complete

                    setUploading(false);
                } catch (error) {
                    console.error("Error uploading file:", error);
                    setUploadError("Fehler beim Hochladen der Datei. Bitte versuchen Sie es erneut.");
                    setUploading(false);
                }
            }
        },
        [setShowSpinner, purchaseData, setPurchaseData, setModalOpen, setModalContent, setColorSpace, setDpi]
    );

    // Function to show details again by opening the modal
    const handleShowDetails = () => {
        if (uploadedFile) {
            setModalOpen(true);
        }
    };

    // Function to handle deleting the uploaded image
    const handleDeleteUpload = () => {
        setUploadedFile(null);
        setPurchaseData({ ...purchaseData, uploadedGraphic: null, uploadedGraphicFile: null });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="lg:px-16 lg:mt-8">
            <ContentWrapper data={stepData}>
                <>
                    <div
                        {...getRootProps()}
                        className="flex flex-col  items-center justify-center  bg-gray-100 border-dashed border-2 p-12 border-gray-400"
                    >
                        <input {...getInputProps()} />
                        <div className="text-center">
                            {isDragActive ? (
                                <p className="font-body font-semibold text-xl text-primaryColor">
                                    Lassen Sie los, um die Grafik hochzuladen!
                                </p>
                            ) : (
                                <p className="font-body font-semibold text-xl text-gray-700">
                                    Ziehen Sie Ihre Grafik hierher oder klicken Sie, um eine Datei hochzuladen.
                                </p>
                            )}
                            <button
                                type="button"
                                className="mt-6 px-6 py-2 bg-primaryColor text-white rounded-lg hover:bg-primaryColor-600"
                            >
                                Datei auswählen
                            </button>
                        </div>
                        {uploadError && (
                            <div className="mt-4 text-center">
                                <p className="font-body text-red-600">{uploadError}</p>
                            </div>
                        )}
                        {uploadedFile && !uploading && (
                            <div className="mt-4 text-center">
                                <p className="font-body text-gray-700">Hochgeladene Datei: {uploadedFile.name}</p>
                            </div>
                        )}
                    </div>
                    <P klasse="!text-sm mt-4 mb-4">
                        Akzeptierte Formate: JPG, PNG, PDF, TIFF, AI, EPS
                        <br />
                        max 10 MB
                    </P>
                    {uploadedFile && (
                        <div className="flex items-center gap-4 mt-4 font-body text-sm">
                            <img
                                className="max-h-40 rounded-[20px]"
                                src={URL.createObjectURL(uploadedFile)}
                                alt="Uploaded Preview"
                            />
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    className="flex items-center px-4 py-2 bg-errorColor text-white rounded-lg hover:bg-red-600"
                                    onClick={handleDeleteUpload}
                                >
                                    <FiTrash2 className="mr-2" /> Löschen
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center px-4 py-2 bg-successColor text-white rounded-lg hover:bg-primaryColor-600"
                                    onClick={handleShowDetails}
                                >
                                    <FiInfo className="mr-2" /> Details anzeigen
                                </button>
                            </div>
                        </div>
                    )}
                </>
            </ContentWrapper>
        </div>
    );
}