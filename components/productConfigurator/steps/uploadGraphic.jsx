import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import ContentWrapper from "../components/contentWrapper";
import PdfPreview from "@/components/pdfPreview";
import { P } from "@/components/typography";
import Link from "next/link";
import GeneralCheckBox from "@/components/inputs/generalCheckbox";
import { motion, AnimatePresence } from "framer-motion";
import { GraphicUploadModalContent } from "@/components/modalContent";
import { TbDragDrop } from "react-icons/tb";
import { FiTrash2, FiChevronDown } from "react-icons/fi";

import uploadAllGraphics from "@/functions/uploadGraphic";
import analyzeImageWithOpenAI from "@/functions/analyzeImageWithOpenAI";

// ✅ neue IndexedDB-Helpers (Multi-Graphic kompatibel)
import { getRecentGraphics, deleteGraphicFromDB } from "@/indexedDB/graphics";

import useStore from "@/store/store";
import { v4 as uuidv4 } from "uuid";

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

    const currentSide = purchaseData.currentSide || "front";

    const [uploadedFile, setUploadedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(true);
    const [uploadError, setUploadError] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);

    const [cachedGraphics, setCachedGraphics] = useState([]);
    const [selectedCachedId, setSelectedCachedId] = useState(null);
    const [showCached, setShowCached] = useState(false);

    const stepData = { title: "Grafik hochladen" };

    // aktives Element (Multi-Graphic)
    const activeGraphic = purchaseData.sides[currentSide]?.uploadedGraphics?.find(
        (g) => g.id === purchaseData.sides[currentSide]?.activeGraphicId
    );

    // Cached Grafiken aus IndexedDB holen (per UserId + TTL)
    useEffect(() => {
        (async () => {
            const userId = purchaseData?.userId || "anonymous";
            const imgs = await getRecentGraphics({ userId, ttlHours: 48, limit: 24 });
            setCachedGraphics(imgs);
        })();
    }, [purchaseData?.userId]);

    // Preview-Quelle bestimmen (PDF → Preview, Image → ObjectURL)
    useEffect(() => {
        // PDF → nimm das generierte Preview (String/dataURL)
        if (activeGraphic?.isPDF && activeGraphic.preview) {
            setPreviewUrl(activeGraphic.preview);
            return;
        }

        // Image → Objekt-URL
        if (uploadedFile) {
            const url = URL.createObjectURL(uploadedFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }

        setPreviewUrl(null);
    }, [uploadedFile, activeGraphic]);

    // lokaler UI-State für „zuletzt hochgeladen“
    useEffect(() => {
        setUploadedFile(purchaseData.sides[currentSide]?.uploadedGraphicFile || null);
    }, [currentSide, purchaseData]);

    const handleDeleteCached = async (id) => {
        await deleteGraphicFromDB(id); // ✅ neu
        setCachedGraphics((prev) => prev.filter((g) => g.id !== id));
        if (selectedCachedId === id) setSelectedCachedId(null);
    };

    // Dateien fallen lassen ODER aus Cache anklicken → gleicher Flow
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
                stepAhead: true,
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

    // Dropzone: öffnet File-Dialog manuell (noClick)
    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        multiple: false,
        noClick: true,
        accept: {
            "image/*": [".jpg", ".jpeg", ".png"],
            "application/pdf": [".pdf"],
        },
    });

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

    // „Text statt Grafik“ – fügt Text als Element hinzu (Multi-Flow bleibt unberührt)
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

        if (steps[currentStep] === "Upload") {
            setTimeout(() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1)), 50);
        }
    };

    return (
        <div className="lg:px-16 lg:mt-4 2xl:mt-8">
            <ContentWrapper data={{ title: "Grafik hochladen" }}>
                <>
                    <AnimatePresence>
                        {!acceptedDisclaimer && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="mb-4 p-4 bg-accentColor/70 border border-gray-300 rounded-lg"
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
                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                    {...getRootProps()}
                                    className={[
                                        "relative w-full overflow-hidden",
                                        // Card
                                        "rounded-2xl border bg-gradient-to-b from-primaryColor-50/70 to-primaryColor-100/60",
                                        "border-primaryColor-200/60 shadow-sm",
                                        // Layout
                                        "px-5 py-6 lg:px-10 lg:py-10",
                                        "min-h-[220px] grid place-items-center text-center",
                                        // Interaktion
                                        "transition-all duration-200",
                                        isDragActive
                                            ? "ring-2 ring-primaryColor-400/80 border-primaryColor-400/50 shadow-md scale-[0.998]"
                                            : "hover:shadow-md hover:border-primaryColor-300/60",
                                    ].join(" ")}
                                >
                                    <input {...getInputProps()} />

                                    {/* dezentes Deko-Pattern */}
                                    <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primaryColor-700 via-transparent to-transparent" />

                                    <div className="relative z-10 flex flex-col items-center gap-4 lg:gap-6 max-w-[720px]">
                                        {/* Icon */}
                                        <div
                                            className={[
                                                "flex items-center justify-center rounded-full",
                                                "h-14 w-14 lg:h-16 lg:w-16",
                                                "bg-white/80 border border-primaryColor-200 text-primaryColor-700",
                                            ].join(" ")}
                                        >
                                            <TbDragDrop className="text-3xl lg:text-4xl" />
                                        </div>

                                        {/* Headline */}
                                        {isDragActive ? (
                                            <p className="font-body font-semibold text-base lg:text-xl text-primaryColor-700">
                                                Loslassen zum Hochladen
                                            </p>
                                        ) : (
                                            <div className="space-y-1">
                                                <p className="font-body font-semibold text-[15px] lg:text-xl text-textColor">
                                                    Datei hierher ziehen <span className="opacity-50">oder</span>{" "}
                                                    auswählen
                                                </p>
                                                <p className="text-xs lg:text-sm text-textColor/70">
                                                    Unterstützt: JPG, PNG, PDF • bis 25&nbsp;MB
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row gap-3 mt-1">
                                            <button
                                                type="button"
                                                onClick={open}
                                                className={[
                                                    "inline-flex items-center justify-center",
                                                    "px-5 py-2.5 lg:px-6 lg:py-3 rounded-xl",
                                                    "font-body font-semibold text-white",
                                                    "bg-primaryColor hover:bg-primaryColor-600",
                                                    "transition-colors",
                                                ].join(" ")}
                                            >
                                                Datei auswählen
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleChooseText}
                                                className={[
                                                    "inline-flex items-center justify-center",
                                                    "px-5 py-2.5 lg:px-6 lg:py-3 rounded-xl",
                                                    "font-body font-semibold",
                                                    "bg-white/90 text-gray-900 border border-gray-300",
                                                    "hover:bg-white",
                                                ].join(" ")}
                                            >
                                                Text statt Grafik
                                            </button>
                                        </div>

                                        {/* kleine Chips */}
                                        <div className="hidden lg:flex flex-wrap justify-center gap-2 mt-1">
                                            {["JPG", "PNG", "PDF", "≤ 25 MB"].map((t) => (
                                                <span
                                                    key={t}
                                                    className="px-2.5 py-1 rounded-full text-xs bg-white/70 border border-gray-200 text-gray-700"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Fehler */}
                                        {uploadError && <p className="text-sm text-red-600 mt-1">{uploadError}</p>}

                                        {/* kurze Vorschau nach Upload */}
                                        {uploadedFile && !uploading && (
                                            <div className="mt-1 flex flex-col items-center gap-2">
                                                {previewUrl ? (
                                                    <img
                                                        src={previewUrl}
                                                        alt=""
                                                        className="h-20 lg:h-24 w-auto object-contain rounded-md shadow-sm border border-gray-200 bg-white"
                                                    />
                                                ) : null}
                                                <p className="text-xs lg:text-sm text-gray-600">{uploadedFile?.name}</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Zuletzt benutzte Grafiken (aus IndexedDB, Multi-Flow-kompatibel) */}
                                {/* Zuletzt benutzte Grafiken (aus IndexedDB, Multi-Flow-kompatibel) */}
                                {!uploadedFile && cachedGraphics.length > 0 && (
                                    <div className="mb-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowCached((p) => !p)}
                                            className={[
                                                "w-full flex items-center justify-between",
                                                "bg-accentColor/70 border border-accentColor/50",
                                                "mt-4 px-4 py-3 rounded-2xl shadow-sm",
                                                "font-semibold text-[15px]",
                                                "transition-all hover:shadow-md",
                                            ].join(" ")}
                                        >
                                            <span>Zuletzt benutzte Grafiken</span>
                                            <FiChevronDown
                                                className={[
                                                    "transition-transform duration-200",
                                                    showCached ? "rotate-180" : "rotate-0",
                                                ].join(" ")}
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
                                                    className="overflow-hidden"
                                                >
                                                    <div
                                                        className={[
                                                            "bg-accentColor/40 border border-accentColor/40",
                                                            "rounded-2xl mt-2 px-4 pb-4 pt-3",
                                                        ].join(" ")}
                                                    >
                                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                                            {cachedGraphics.map(({ id, name, blob, preview }) => {
                                                                const isSelected = id === selectedCachedId;
                                                                const thumbSrc =
                                                                    preview || (blob ? URL.createObjectURL(blob) : "");
                                                                return (
                                                                    <button
                                                                        key={id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedCachedId(id);
                                                                            if (!blob) return;
                                                                            const file = new File(
                                                                                [blob],
                                                                                name || "grafik",
                                                                                {
                                                                                    type:
                                                                                        blob.type ||
                                                                                        "application/octet-stream",
                                                                                }
                                                                            );
                                                                            onDrop([file]); // Multi-Upload-Flow
                                                                            // Optional: nach kurzer Zeit URL wieder freigeben
                                                                            setTimeout(() => {
                                                                                try {
                                                                                    URL.revokeObjectURL(thumbSrc);
                                                                                } catch {}
                                                                            }, 2000);
                                                                        }}
                                                                        className={[
                                                                            "group relative overflow-hidden rounded-xl",
                                                                            "bg-white border border-gray-200 shadow-sm",
                                                                            "aspect-square grid place-items-center",
                                                                            "transition-all hover:shadow-md hover:border-primaryColor-300/70",
                                                                            isSelected
                                                                                ? "ring-4 ring-primaryColor/60"
                                                                                : "",
                                                                        ].join(" ")}
                                                                        title={name || "Grafik"}
                                                                    >
                                                                        {/* Delete */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteCached(id);
                                                                            }}
                                                                            className="absolute top-2 right-2 z-10 rounded-full p-1.5 text-white bg-red-600/90 hover:bg-red-700 shadow"
                                                                            aria-label="Grafik löschen"
                                                                        >
                                                                            <FiTrash2 size={14} />
                                                                        </button>

                                                                        {/* Thumb */}
                                                                        {thumbSrc ? (
                                                                            <img
                                                                                src={thumbSrc}
                                                                                alt={name || "Grafik"}
                                                                                className="h-[78%] w-[78%] object-contain pointer-events-none"
                                                                            />
                                                                        ) : (
                                                                            <div className="h-[78%] w-[78%] grid place-items-center text-[11px] text-gray-600">
                                                                                Vorschau fehlt
                                                                            </div>
                                                                        )}

                                                                        {/* Caption */}
                                                                        <div className="absolute bottom-0 left-0 right-0 bg-white/85 backdrop-blur-sm border-t border-gray-200 px-2 py-1">
                                                                            <p className="text-[11px] text-gray-700 truncate">
                                                                                {name || "Unbenannte Grafik"}
                                                                            </p>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
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
