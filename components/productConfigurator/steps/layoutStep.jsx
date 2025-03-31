import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import ContentWrapper from "../components/contentWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { FiUpload } from "react-icons/fi";
import { TextField, Button } from "@mui/material";
import { H3, P } from "@/components/typography";
import useStore from "@/store/store";
import LoadingSpinner from "@/components/spinner";
import { uploadLayoutFile } from "@/config/firebase"; // New upload function

export default function LayoutStep({ product, setCurrentStep, currentStep }) {
    const { purchaseData, setPurchaseData, setShowSpinner } = useStore();
    const [uploadedFile, setUploadedFile] = useState(null);
    const [instructions, setInstructions] = useState("");
    const [uploadError, setUploadError] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Maximum file size in bytes (10 MB)
    const maxFileSize = 10 * 1024 * 1024;
    // Allowed file formats
    const validFormats = ["image/jpeg", "image/png", "application/pdf"];

    // Handle file drop via react-dropzone
    const onDrop = useCallback(
        async (acceptedFiles) => {
            setUploadError(null);
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                // Validate file type
                if (!validFormats.includes(file.type)) {
                    setUploadError("Ungültiges Dateiformat. Bitte laden Sie eine JPG, PNG oder PDF Datei hoch.");
                    return;
                }
                // Validate file size
                if (file.size > maxFileSize) {
                    setUploadError("Die Datei ist zu groß. Maximal 10 MB erlaubt.");
                    return;
                }
                // File is valid: set local state and start uploading
                setUploadedFile(file);
                setUploading(true);
                setShowSpinner(true); // Show spinner when uploading starts

                try {
                    // Get userId from purchaseData or default to "anonymous"
                    const userId = purchaseData?.userId || "anonymous";
                    // Upload the file using the new function
                    const fileMetadata = await uploadLayoutFile(file, userId);
                    // Update global state with the metadata returned from Firebase
                    setPurchaseData((prev) => ({
                        ...prev,
                        layout: { ...prev.layout, uploadedFile: fileMetadata },
                    }));
                    setShowSpinner(false);
                } catch (error) {
                    console.error("Fehler beim Hochladen der Datei:", error);
                    setShowSpinner(false);

                    setUploadError("Fehler beim Hochladen der Datei. Bitte versuchen Sie es erneut.");
                } finally {
                    setUploading(false);
                    setShowSpinner(false);
                }
            }
        },
        [purchaseData, setPurchaseData]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: validFormats.join(","),
    });

    // Update instructions in global state as they change
    const handleInstructionChange = (e) => {
        const value = e.target.value;
        setInstructions(value);
        setPurchaseData((prev) => ({
            ...prev,
            layout: { ...prev.layout, instructions: value },
        }));
    };

    // Proceed to the next step when user clicks "Weiter"
    const handleNext = () => {
        // Final update (if needed) and move to next step
        setPurchaseData((prev) => ({
            ...prev,
            layout: {
                ...prev.layout,
                instructions,
                // uploadedFile is already set from the upload function
            },
        }));
        setCurrentStep(currentStep + 1);
    };

    return (
        <div className="lg:px-16 lg:mt-4">
            <ContentWrapper data={{ title: "Layout erstellen lassen" }}>
                <div className="mb-4">
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
                                {uploadedFile && !uploading && (
                                    <p className="font-body text-gray-700">Hochgeladene Datei: {uploadedFile.name}</p>
                                )}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Accepted formats message */}
                <P klasse="mt-2 text-sm text-gray-600">Akzeptierte Formate: JPG, PNG, PDF | Maximal 10 MB</P>

                <div className="mt-4">
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Ihre Layout Vorgaben (optional)"
                        variant="outlined"
                        value={instructions}
                        onChange={handleInstructionChange}
                    />
                </div>
                <P klasse="mt-4 font-bold">+ EUR 20,00 pro Motiv und Farbe</P>

                {uploadError && (
                    <div className="mt-4 text-center">
                        <P klasse="text-red-600">{uploadError}</P>
                    </div>
                )}

                {uploading && (
                    <div className="mt-4 flex flex-col items-center">
                        <LoadingSpinner />
                        <P klasse="mt-2">Datei wird hochgeladen…</P>
                    </div>
                )}

                {/* <div className="mt-6 flex justify-center">
          <Button
            variant="contained"
            onClick={handleNext}
            className="!font-semibold"
            disabled={uploading}
          >
            Weiter
          </Button>
        </div> */}
            </ContentWrapper>
        </div>
    );
}
