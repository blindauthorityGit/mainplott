import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import ContentWrapper from "../components/contentWrapper";
import { uploadFileToTempFolder } from "@/config/firebase"; // Import the upload function from your firebase configuration
import { analyzeImage } from "@/functions/analyzeImage"; // Import the analyzeImage function
import { analyzePdf } from "@/functions/analyzePdf"; // Import the analyzePdf function
import PdfPreview from "@/components/pdfPreview";
import { P } from "@/components/typography";
import Link from "next/link"; // Import Next.js Link for navigation
import GeneralCheckBox from "@/components/inputs/generalCheckbox"; // Import custom checkbox component
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion

import { GraphicUploadModalContent } from "@/components/modalContent"; // Import the new modal content component
import LoadingSpinner from "@/components/spinner"; // Import the loading spinner component
import { H3 } from "@/components/typography";
import { TbDragDrop } from "react-icons/tb";

import analyzeImageWithOpenAI from "@/functions/analyzeImageWithOpenAI";

//IDB
// import { saveImageToDB, getImageFromDB } from "@/indexedDB";

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
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploading, setUploading] = useState(true);
    const [uploadError, setUploadError] = useState(null);
    const [currentSide, setCurrentSide] = useState("front"); // Track the current side being worked on
    const [isChecked, setIsChecked] = useState(false); // State for disclaimer acceptance
    const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false); // State for disclaimer acceptance

    const stepData = {
        title: "Grafik hochladen",
    };

    async function handleImageUpload(file) {
        const blob = new Blob([file], { type: file.type });
        await saveImageToDB(file.name, blob); // Save image to IndexedDB
    }

    useEffect(() => {
        // Set uploaded file from purchaseData when side or purchaseData changes
        setUploadedFile(purchaseData.sides[currentSide]?.uploadedGraphicFile || null);
    }, [currentSide, purchaseData]);

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

                // Update the purchaseData for the current side
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

                    // setPurchaseData({
                    //     ...purchaseData,
                    //     sides: {
                    //         ...purchaseData.sides,
                    //         [currentSide]: {
                    //             ...purchaseData.sides[currentSide],
                    //             uploadedGraphic: fileMetadata,
                    //             uploadedGraphicFile: file,
                    //         },
                    //     },
                    // });
                    console.log(fileMetadata);

                    // Determine what kind of analysis is needed based on file type
                    if (file.type === "image/jpeg" || file.type === "image/png") {
                        setPurchaseData({
                            ...purchaseData,
                            sides: {
                                ...purchaseData.sides,
                                [currentSide]: {
                                    ...purchaseData.sides[currentSide],
                                    uploadedGraphic: fileMetadata,
                                    uploadedGraphicFile: file,
                                },
                            },
                        });

                        // Analyze JPEG or PNG with sharp
                        const analysisResult = await analyzeImage(file);
                        if (analysisResult) {
                            console.log(analysisResult);
                            setColorSpace(analysisResult.colorSpace);
                            setDpi(analysisResult.dpi);
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
                        console.log("PDF Analysis Link:", pdfAnalysisResult.previewImage);

                        // Call OpenAI with the PDF preview image and a prompt
                        const openAIResponse = await analyzeImageWithOpenAI(
                            pdfAnalysisResult.previewImage,
                            "What do you see?"
                        );
                        console.log("OpenAI Analysis:", openAIResponse);

                        // 2) Convert that previewImage URL to a Blob/File
                        // const previewUrl = pdfAnalysisResult.previewImage; // e.g. "https://firebasestorage.googleapis.com/..."
                        // const response = await fetch(previewUrl); // CORS must be allowed in Firebase
                        // const blob = await response.blob();
                        // // Construct a File so it looks like a typical "uploaded" image
                        // const previewFile = new File([blob], "pdf-preview.png", {
                        //     type: "image/png",
                        //     lastModified: Date.now(),
                        // });
                        // console.log("PDF PREVIEW FILE", previewFile);
                        setPurchaseData({
                            ...purchaseData,
                            sides: {
                                ...purchaseData.sides,
                                [currentSide]: {
                                    ...purchaseData.sides[currentSide],
                                    uploadedGraphic: fileMetadata,
                                    uploadedGraphicFile: file,
                                    isPDF: true,
                                    preview: pdfAnalysisResult.previewImage,
                                },
                            },
                        });
                        setModalContent(
                            <GraphicUploadModalContent
                                file={file}
                                preview={pdfAnalysisResult.previewImage}
                                numPages={pdfAnalysisResult.numPages}
                                colorSpace={pdfAnalysisResult.colorSpace}
                                alpha={pdfAnalysisResult.alphaChannel}
                                size={pdfAnalysisResult.fileSize}
                                previewComponent={<PdfPreview file={file} />}
                                onNewFileUpload={handleNewFileUpload} // Pass the function here
                                steps={steps}
                                setCurrentStep={setCurrentStep}
                                currentStep={currentStep} // Pass the function here
                                setModalOpen={setModalOpen} // Pass the modal control function
                            />
                        );
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
                    setShowSpinner(false);
                }
            }
        },
        [
            setShowSpinner,
            purchaseData,
            setPurchaseData,
            setModalOpen,
            setModalContent,
            setColorSpace,
            setDpi,
            currentSide,
        ]
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
        setPurchaseData({
            ...purchaseData,
            sides: {
                ...purchaseData.sides,
                [currentSide]: {
                    ...purchaseData.sides[currentSide],
                    uploadedGraphic: null,
                    uploadedGraphicFile: null,
                },
            },
        });
    };

    // Toggle acceptance of disclaimer
    const handleDisclaimerCheck = () => {
        setIsChecked(true);
        setTimeout(() => {
            setAcceptedDisclaimer(!acceptedDisclaimer);
        }, 400);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="lg:px-16 lg:mt-4 2xl:mt-8">
            <ContentWrapper data={stepData}>
                <>
                    <AnimatePresence>
                        {!acceptedDisclaimer && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="mb-4 p-4 bg-accentColor border border-gray-300 rounded-lg"
                            >
                                <H3 klasse="text-lg text-errorColor mb-2">ZUERST LESEN, DANN UPLOADEN</H3>
                                <P klasse="mb-4 text-sm text-gray-700">
                                    Bitte beachten Sie, dass Sie nur Grafiken hochladen dürfen, die Ihnen gehören oder
                                    für deren Nutzung Sie die Erlaubnis haben. Weitere Informationen finden Sie auf
                                    unserer{" "}
                                    <Link href="/datenschutz">
                                        <span className="text-primaryColor underline">Datenschutz-Seite</span>
                                    </Link>
                                    .
                                </P>
                                <GeneralCheckBox
                                    label="Ich habe die Bedingungen gelesen und akzeptiere sie."
                                    isChecked={isChecked}
                                    onToggle={handleDisclaimerCheck}
                                    borderColor="border-gray-400"
                                    checkColor="text-successColor"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {acceptedDisclaimer && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                {...getRootProps()}
                                className="flex flex-col items-center justify-center bg-primaryColor-100 rounded-[20px] border-dashed border-2 p-8 lg:p-12 border-gray-400"
                            >
                                <input {...getInputProps()} />
                                <div className="text-center">
                                    {isDragActive ? (
                                        <p className="font-body font-semibold text-xl text-primaryColor">
                                            Lassen Sie los, um die Grafik hochzuladen!
                                        </p>
                                    ) : (
                                        <>
                                            <p className="font-body hidden lg:block font-semibold text-xl text-textColor">
                                                Ziehen Sie Ihre Grafik hierher oder klicken Sie, um eine Datei
                                                hochzuladen.
                                            </p>
                                            <p className="font-body lg:hidden font-semibold text-lg text-textColor">
                                                Wählen Sie Ihre Grafik
                                            </p>{" "}
                                        </>
                                    )}
                                    <div className="flex justify-center text-6xl p-6 text-textColor">
                                        <TbDragDrop></TbDragDrop>
                                    </div>
                                    <button
                                        type="button"
                                        className="px-6 py-2 !font-semibold bg-primaryColor font-body text-white rounded-lg hover:bg-primaryColor-600"
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
                                        <p className="font-body text-gray-700">
                                            Hochgeladene Datei: {uploadedFile.name}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <P klasse="!text-sm mt-4 mb-4">
                        Akzeptierte Formate: JPG, PNG, PDF
                        <br />
                        max 10 MB
                    </P>
                </>
            </ContentWrapper>
        </div>
    );
}
