import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import ContentWrapper from "../components/contentWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { FiUpload } from "react-icons/fi";
import { TextField } from "@mui/material";
import { H3, P } from "@/components/typography";
import useStore from "@/store/store";
import LoadingSpinner from "@/components/spinner";
import { uploadLayoutFile } from "@/config/firebase"; // New upload function
import GeneralCheckBox from "@/components/inputs/generalCheckbox";

export default function LayoutStep({ product, setCurrentStep, currentStep, layoutService }) {
    const { purchaseData, setPurchaseData, setShowSpinner } = useStore();

    // Initialize state from global purchaseData if available
    const initialInstructions = purchaseData.layout?.instructions || "";
    const initialUploadedFile = purchaseData.layout?.uploadedFile || null;
    const initialLayoutServiceChecked = purchaseData.layoutServiceSelected || false;

    const [uploadedFile, setUploadedFile] = useState(initialUploadedFile);
    const [instructions, setInstructions] = useState(initialInstructions);
    const [uploadError, setUploadError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isLayoutChecked, setIsLayoutChecked] = useState(initialLayoutServiceChecked);

    const maxFileSize = 10 * 1024 * 1024; // 10 MB
    const validFormats = ["image/jpeg", "image/png", "application/pdf"];

    // Handle file drop via react-dropzone
    const onDrop = useCallback(
        async (acceptedFiles) => {
            setUploadError(null);
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                if (!validFormats.includes(file.type)) {
                    setUploadError("Ungültiges Dateiformat. Bitte laden Sie eine JPG, PNG oder PDF Datei hoch.");
                    return;
                }
                if (file.size > maxFileSize) {
                    setUploadError("Die Datei ist zu groß. Maximal 10 MB erlaubt.");
                    return;
                }
                // File is valid: update local state and start uploading
                setUploadedFile(file);
                setUploading(true);
                setShowSpinner(true);

                try {
                    const userId = purchaseData?.userId || "anonymous";
                    const fileMetadata = await uploadLayoutFile(file, userId);
                    // Save file metadata in global state
                    setPurchaseData((prev) => ({
                        ...prev,
                        layout: { ...prev.layout, uploadedFile: fileMetadata },
                    }));
                } catch (error) {
                    console.error("Fehler beim Hochladen der Datei:", error);
                    setUploadError("Fehler beim Hochladen der Datei. Bitte versuchen Sie es erneut.");
                } finally {
                    setUploading(false);
                    setShowSpinner(false);
                }
            }
        },
        [purchaseData, setPurchaseData, setShowSpinner]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: validFormats.join(","),
    });

    // Update instructions as they change and update global state immediately
    const handleInstructionChange = (e) => {
        const value = e.target.value;
        setInstructions(value);
        setPurchaseData((prev) => ({
            ...prev,
            layout: { ...prev.layout, instructions: value },
        }));
    };

    // Handler for the Layout Service checkbox (similar to your Profi Datencheck)
    const handleLayoutToggle = () => {
        // Extract layout service price and id from the passed layoutService data
        const layoutServicePrice = Number(layoutService?.[0]?.node?.variants?.edges?.[0]?.node?.price?.amount || 0);
        const layoutServiceId = layoutService?.[0]?.node?.variants?.edges?.[0]?.node?.id || null;

        setIsLayoutChecked((prev) => {
            const newValue = !prev;
            const updatedVariants = { ...purchaseData.variants };
            if (newValue) {
                updatedVariants.layoutService = {
                    id: layoutServiceId,
                    price: layoutServicePrice,
                    quantity: 1,
                };
            } else {
                delete updatedVariants.layoutService;
            }
            setPurchaseData((prevData) => ({
                ...prevData,
                layoutServiceSelected: newValue, // <-- Flag used for validation in the parent
                layoutServicePrice: newValue ? layoutServicePrice : 0,
                variants: updatedVariants,
            }));
            return newValue;
        });
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

                {/* Layout Service Checkbox */}
                <div className="flex bg-accentColor p-4 mt-4 justify-around">
                    <P klasse="!text-xs">
                        Layout Service hinzufügen
                        <span className="font-semibold">
                            <br />+ {layoutService?.[0]?.node?.variants?.edges?.[0]?.node?.price?.amount || "0.00"} EUR
                        </span>
                    </P>
                    <GeneralCheckBox label="Layout Service" isChecked={isLayoutChecked} onToggle={handleLayoutToggle} />
                </div>

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
            </ContentWrapper>
        </div>
    );
}
