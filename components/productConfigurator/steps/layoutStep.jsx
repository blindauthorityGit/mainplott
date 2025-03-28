import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import ContentWrapper from "../components/contentWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { FiUpload } from "react-icons/fi";
import { TextField, Button } from "@mui/material";
import { H3, P } from "@/components/typography";
import useStore from "@/store/store";
import LoadingSpinner from "@/components/spinner";

export default function LayoutStep({ product, setCurrentStep, currentStep }) {
    const { purchaseData, setPurchaseData } = useStore();
    const [uploadedFile, setUploadedFile] = useState(null);
    const [instructions, setInstructions] = useState("");
    const [uploadError, setUploadError] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Handle file drop via react-dropzone
    const onDrop = useCallback(
        (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                // Optionally: Validate file type/size here if needed
                setUploadedFile(file);
                // Update global state for layout (or store locally to later update)
                setPurchaseData({
                    ...purchaseData,
                    layout: { ...purchaseData.layout, uploadedFile: file },
                });
            }
        },
        [purchaseData, setPurchaseData]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: "image/*", // Accept images; adjust if you want other formats.
    });

    // Proceed to the next step when user clicks "Weiter"
    const handleNext = () => {
        // Save instructions and file (if any) in global state
        setPurchaseData({
            ...purchaseData,
            layout: {
                ...purchaseData.layout,
                instructions,
                uploadedFile,
            },
        });
        // Move to the next step
        setCurrentStep(currentStep + 1);
    };

    return (
        <div className="lg:px-16 lg:mt-4">
            <ContentWrapper data={{ title: "Layout erstellen lassen" }}>
                <div className="mb-4">
                    {/* <P klasse="text-lg">Optional: Layout Vorgaben</P> */}
                    <P>
                        Geben Sie hier an, wie Ihr Layout aussehen soll – Sie können entweder Ihre Vorgaben eintippen
                        oder ein Beispielbild hochladen.
                    </P>
                </div>

                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        {...getRootProps()}
                        className="border-dashed border-2 p-6 rounded-lg text-center cursor-pointer"
                    >
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <p className="font-semibold text-xl text-primaryColor">
                                Lassen Sie los, um die Grafik hochzuladen!
                            </p>
                        ) : (
                            <>
                                <p className="font-body hidden lg:block font-semibold text-xl text-textColor">
                                    Ziehen Sie Ihre Grafik hierher oder klicken Sie, um eine Datei hochzuladen.
                                </p>
                                <p className="font-body lg:hidden font-semibold text-lg text-textColor">
                                    Grafik auswählen
                                </p>
                                <div className="flex justify-center text-6xl p-6 text-textColor">
                                    <FiUpload />
                                </div>
                                {uploadedFile && (
                                    <p className="font-body text-gray-700">Hochgeladene Datei: {uploadedFile.name}</p>
                                )}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="mt-4">
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Ihre Layout Vorgaben (optional)"
                        variant="outlined"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                    />
                </div>
                <P klasse="mt-4 font-bold">+ EUR 20,00 pro Motiv und Farbe</P>

                {uploadError && (
                    <div className="mt-4 text-center">
                        <P klasse="text-red-600">{uploadError}</P>
                    </div>
                )}

                {uploading && <LoadingSpinner />}
            </ContentWrapper>
        </div>
    );
}
