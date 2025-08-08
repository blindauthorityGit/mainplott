import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import ContentWrapper from "../components/contentWrapper";
import { uploadFileToTempFolder } from "@/config/firebase";
import { analyzeImage } from "@/functions/analyzeImage";
import { analyzePdf } from "@/functions/analyzePdf";
import PdfPreview from "@/components/pdfPreview";
import { P, H4 } from "@/components/typography";
import Link from "next/link";
import GeneralCheckBox from "@/components/inputs/generalCheckbox";
import { motion, AnimatePresence } from "framer-motion";

import { GraphicUploadModalContent } from "@/components/modalContent";
import LoadingSpinner from "@/components/spinner";
import { H3 } from "@/components/typography";
import { TbDragDrop } from "react-icons/tb";
import { FiTrash2, FiChevronDown } from "react-icons/fi";

import uploadAllGraphics from "@/functions/uploadGraphic";
import analyzeImageWithOpenAI from "@/functions/analyzeImageWithOpenAI";
import { saveImageToDB, getImagesFromDB, deleteImageFromDB } from "@/indexedDB/graphics";

import useStore from "@/store/store";
import { v4 as uuidv4 } from "uuid"; // NEW

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
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(true);
    const [uploadError, setUploadError] = useState(null);
    const currentSide = purchaseData.currentSide || "front";
    const [isChecked, setIsChecked] = useState(false);
    const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);

    const [cachedGraphics, setCachedGraphics] = useState([]);
    const [selectedCachedId, setSelectedCachedId] = useState(null);
    const [showCached, setShowCached] = useState(false);

    const stepData = { title: "Grafik hochladen" };

    async function handleImageUpload(file) {
        const blob = new Blob([file], { type: file.type });
        await saveImageToDB(file.name, blob);
    }

    useEffect(() => {
        (async () => {
            const imgs = await getImagesFromDB();
            setCachedGraphics(imgs);
        })();
    }, []);

    useEffect(() => {
        if (uploadedFile) {
            const url = URL.createObjectURL(uploadedFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [uploadedFile]);

    useEffect(() => {
        setUploadedFile(purchaseData.sides[currentSide]?.uploadedGraphicFile || null);
    }, [currentSide, purchaseData]);

    const handleDeleteCached = async (id) => {
        await deleteImageFromDB(id);
        setCachedGraphics((prev) => prev.filter((g) => g.id !== id));
        if (selectedCachedId === id) setSelectedCachedId(null);
    };

    const handleUseSelected = () => {
        if (!selectedCachedId) return;
        const sel = cachedGraphics.find((g) => g.id === selectedCachedId);
        if (!sel) return;
        const file = new File([sel.blob], sel.name, { type: sel.blob.type });
        // gleiche Logic wie Drop:
        onDrop([file]);
    };

    // ---------------- Drop & Select – EINE Logik ----------------
    const onDrop = useCallback(
        async (acceptedFiles) => {
            if (!acceptedFiles || !acceptedFiles.length) return;
            const file = acceptedFiles[0];

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
                stepAhead: true, // direkt weiter wie bisher
            });
        },
        [
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
        ]
    );

    // NEW: wir deaktivieren den Auto-Click vom Root und öffnen die File-Dialog
    //      manuell über open() – das triggert **denselben** onDrop-Flow.
    const {
        getRootProps,
        getInputProps,
        isDragActive,
        open, // NEW
    } = useDropzone({
        onDrop,
        multiple: false,
        noClick: true, // NEW: Root klickt nicht mehr automatisch
        accept: {
            "image/*": [".jpg", ".jpeg", ".png"],
            "application/pdf": [".pdf"],
        },
    });

    const handleShowDetails = () => {
        if (uploadedFile) setModalOpen(true);
    };

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

    const handleDisclaimerCheck = () => {
        setIsChecked(true);
        setTimeout(() => setAcceptedDisclaimer((v) => !v), 400);
    };

    // NEW: „Text statt Grafik“ – legt Text an & geht weiter
    const handleChooseText = () => {
        const rect = purchaseData.boundingRect || {
            x: 0,
            y: 0,
            width: purchaseData.containerWidth || 500,
            height: purchaseData.containerHeight || 500,
        };
        const cx = rect.x + rect.width / 2;
        const cy = rect.y + rect.height / 2;

        const id = uuidv4();
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [currentSide]: {
                    ...prev.sides[currentSide],
                    texts: [
                        ...(prev.sides[currentSide].texts || []),
                        {
                            id,
                            value: "Text hier bearbeiten",
                            x: cx,
                            y: cy,
                            fontSize: 36,
                            fontFamily: "Roboto",
                            fill: "#000",
                            scale: 1,
                            rotation: 0,
                        },
                    ],
                    activeTextId: id,
                    activeElement: { type: "text", id },
                },
            },
        }));

        // gleich weiter zum nächsten Step (wie stepAhead)
        if (steps[currentStep] === "Upload") {
            setTimeout(() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1)), 50);
        }
    };

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
                                <P klasse="text-lg text-errorColor font-semibold mb-2">ZUERST LESEN, DANN UPLOADEN</P>
                                <P klasse="mb-4 !text-xs text-gray-700">
                                    Bitte beachten Sie, dass Sie nur Grafiken hochladen dürfen, die Ihnen gehören…
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
                            <>
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    {...getRootProps()}
                                    className="flex flex-col items-center justify-center bg-primaryColor-100 rounded-[20px] border-dashed border-2 p-8 lg:p-12 border-gray-400"
                                >
                                    {/* dropzone input – triggert onDrop */}
                                    <input {...getInputProps()} />

                                    <div className="text-center">
                                        {isDragActive ? (
                                            <p className="font-body font-semibold text-xl text-primaryColor">
                                                Lassen Sie los, um die Grafik hochzuladen!
                                            </p>
                                        ) : (
                                            <>
                                                <p className="font-body hidden lg:block font-semibold 2xl:text-xl text-textColor">
                                                    Ziehen Sie Ihre Grafik hierher oder wählen Sie eine Datei.
                                                </p>
                                                <p className="font-body lg:hidden font-semibold text-lg text-textColor">
                                                    Wählen Sie Ihre Grafik
                                                </p>
                                            </>
                                        )}

                                        <div className="flex justify-center text-6xl p-6 text-textColor">
                                            <TbDragDrop />
                                        </div>

                                        <div className="flex gap-3 justify-center">
                                            {/* Datei auswählen → nutzt dropzone.open() → ruft onDrop → uploadAllGraphics */}
                                            <button
                                                type="button"
                                                onClick={open} // NEW: gleiche Logik wie Drop
                                                className="px-6 py-2 !font-semibold bg-primaryColor font-body text-white rounded-lg hover:bg-primaryColor-600"
                                            >
                                                Datei auswählen
                                            </button>

                                            {/* NEW: Alternative – direkt Text anlegen */}
                                            <button
                                                type="button"
                                                onClick={handleChooseText}
                                                className="px-6 py-2 !font-semibold bg-gray-800 font-body text-white rounded-lg hover:bg-gray-900"
                                            >
                                                Text statt Grafik
                                            </button>
                                        </div>
                                    </div>

                                    {uploadError && (
                                        <div className="mt-4 text-center">
                                            <p className="font-body text-red-600">{uploadError}</p>
                                        </div>
                                    )}

                                    {uploadedFile && !uploading && (
                                        <div className="mt-4 text-center flex flex-col items-center">
                                            <img src={previewUrl} className="max-h-24" alt="" />
                                            <p className="font-body text-gray-700">
                                                Hochgeladene Datei: {uploadedFile.name}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Zuletzt benutzte Grafiken */}
                                {!uploadedFile && cachedGraphics.length > 0 && (
                                    <div className="mb-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowCached((p) => !p)}
                                            className="w-full flex items-center justify-between bg-accentColor mt-4 px-4 py-3 rounded-lg shadow font-semibold"
                                        >
                                            <span>Zuletzt benutzte Grafiken</span>
                                            <FiChevronDown
                                                className={`transition-transform ${
                                                    showCached ? "rotate-180" : "rotate-0"
                                                }`}
                                            />
                                        </button>
                                        <AnimatePresence initial={false}>
                                            {showCached && (
                                                <motion.div
                                                    key="panel"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                                    className="overflow-hidden bg-accentColor/50 px-4 pb-4 rounded-b-lg"
                                                >
                                                    <div className="pt-4 flex flex-wrap gap-4">
                                                        {cachedGraphics.map(({ id, name, blob }) => {
                                                            const isSelected = id === selectedCachedId;
                                                            return (
                                                                <div key={id} className="relative group">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteCached(id);
                                                                        }}
                                                                        className="absolute -top-2 -right-2 bg-red-600 p-1.5 rounded-full text-white shadow hover:bg-red-700"
                                                                    >
                                                                        <FiTrash2 size={14} />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedCachedId(id);
                                                                            const file = new File([blob], name, {
                                                                                type: blob.type,
                                                                            });
                                                                            onDrop([file]); // gleiche Pipeline
                                                                        }}
                                                                        className={`rounded-lg overflow-hidden shadow focus:outline-none ${
                                                                            isSelected ? "ring-4 ring-primaryColor" : ""
                                                                        }`}
                                                                    >
                                                                        <img
                                                                            src={URL.createObjectURL(blob)}
                                                                            alt={name}
                                                                            className="h-24 w-24 object-contain"
                                                                        />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </>
                        )}
                    </AnimatePresence>

                    <P klasse="!text-xs mt-4 mb-4">
                        Akzeptierte Formate: JPG, PNG, PDF
                        <br />
                        max 25 MB
                    </P>
                </>
            </ContentWrapper>
        </div>
    );
}
