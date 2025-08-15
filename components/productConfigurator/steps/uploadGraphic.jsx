import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import ContentWrapper from "../components/contentWrapper";
import PdfPreview from "@/components/pdfPreview";
import { P } from "@/components/typography";
import LibraryPanel from "../libraryPanel"; // dein Panel

import Link from "next/link";
import GeneralCheckBox from "@/components/inputs/generalCheckbox";
import { motion, AnimatePresence } from "framer-motion";
import { GraphicUploadModalContent } from "@/components/modalContent";
import { TbDragDrop } from "react-icons/tb";
import { FiTrash2, FiChevronDown } from "react-icons/fi";

import uploadAllGraphics from "@/functions/uploadGraphic";
import analyzeImageWithOpenAI from "@/functions/analyzeImageWithOpenAI";
import syncDecorations from "@/functions/syncDecorations";
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
    const [showLibrary, setShowLibrary] = useState(false);

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
    // 👇 ersetzt deinen bisherigen Preview-Effect
    useEffect(() => {
        // Library-Asset aktiv?
        if (activeGraphic) {
            if (activeGraphic.isPDF && activeGraphic.preview) {
                setPreviewUrl(activeGraphic.preview);
            } else if (activeGraphic.downloadURL || activeGraphic.url) {
                setPreviewUrl(activeGraphic.downloadURL || activeGraphic.url);
            }
            setUploading(false);
            return;
        }

        // Fallback: lokales File
        if (uploadedFile) {
            const url = URL.createObjectURL(uploadedFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }

        setPreviewUrl(null);
    }, [activeGraphic, uploadedFile]);

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
            if (!acceptedFiles?.length) return;
            const file = acceptedFiles[0];

            try {
                await uploadAllGraphics({
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
                    stepAhead: false,
                });
            } catch (e) {
                setUploadError(e?.message || String(e));
            }
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
            product,
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

        setPurchaseData((prev) => {
            const next = {
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
            };
            // run after state flush (no setState nesting)
            queueMicrotask(() => {
                const latest = getState().purchaseData || next;
                syncDecorations({ purchaseData: latest, setPurchaseData, product: latest?.product || product });
            });
            return next;
        });

        if (steps[currentStep] === "Upload") {
            setTimeout(() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1)), 50);
        }
    };

    // Canvas-Zielgröße aus deinem State ableiten (Fallbacks ok)
    const getDstCanvas = () => ({
        width: purchaseData?.containerWidth || 800,
        height: purchaseData?.containerHeight || 800,
    });

    // Quelle -> Ziel skalieren (wenn asset.canvas existiert)
    function normalizePlacement(placement, srcCanvas, dstCanvas) {
        const p = placement || { x: 300, y: 200, scale: 1, rotation: 0 };
        if (!srcCanvas?.width || !srcCanvas?.height || !dstCanvas?.width || !dstCanvas?.height) return p;
        const sx = dstCanvas.width / srcCanvas.width;
        const sy = dstCanvas.height / srcCanvas.height;
        const s = Math.min(sx, sy);
        return { x: p.x * sx, y: p.y * sy, scale: p.scale * s, rotation: p.rotation };
    }

    // === Bild aus Library einfügen — exakt wie Cached ===
    const insertImageFromLibrary = async (asset) => {
        try {
            // Sofort eine Vorschau zeigen (wie beim Cached-Klick fühlt es sich reaktiv an)
            if (asset?.preview || asset?.url) {
                setPreviewUrl(asset.preview || asset.url);
                setUploading(false);
            }

            setShowSpinner?.(true);

            // 1) Bild von der URL holen
            //    (bei Firebase-/GCS-Download-Links passt CORS; alt=media wird unten ggf. ergänzt)
            let res = await fetch(asset.url, { mode: "cors" });
            if (!res.ok && asset.url && !asset.url.includes("alt=media")) {
                // sanfter Fallback für Firebase-URLs
                const u = asset.url + (asset.url.includes("?") ? "&" : "?") + "alt=media";
                res = await fetch(u, { mode: "cors" });
            }
            if (!res.ok) throw new Error("Bild konnte nicht geladen werden.");

            // 2) Blob -> File (wie aus dem Dateidialog)
            const blob = await res.blob();
            const ext =
                blob.type === "image/png"
                    ? "png"
                    : blob.type === "image/jpeg"
                    ? "jpg"
                    : blob.type === "application/pdf"
                    ? "pdf"
                    : "bin";

            const filename = (asset.name || "library-asset") + "." + ext;
            const file = new File([blob], filename, { type: blob.type || "application/octet-stream" });

            // 3) exakten Upload-Flow der Cached-Grafiken nutzen
            //    -> Placement/State/Preview macht dein bestehendes uploadAllGraphics
            await onDrop([file]); // stepAhead: false (siehe onDrop)

            // optional: Library direkt zuklappen
            // setShowLibrary(false);
        } catch (err) {
            console.error("Library → Upload fehlgeschlagen:", err);
            setUploadError(err?.message || "Fehler beim Übernehmen des Library-Bildes.");
        } finally {
            setShowSpinner?.(false);
        }
    };

    // === Text aus Library einfügen ===
    const insertTextFromLibrary = (asset) => {
        const side = asset.side || currentSide;
        const pl = normalizePlacement(asset.placement, asset.canvas, getDstCanvas());
        const id = uuidv4();

        setPurchaseData((prev) => {
            const next = { ...prev, sides: { ...prev.sides } };
            const sideObj = { ...(next.sides[side] || {}) };

            const texts = Array.isArray(sideObj.texts) ? [...sideObj.texts] : [];
            texts.push({
                id,
                value: asset.value,
                fontFamily: asset.fontFamily,
                fontSize: asset.fontSize,
                fill: asset.fill,
                x: pl.x,
                y: pl.y,
                scale: pl.scale,
                rotation: pl.rotation,
                letterSpacing: asset.letterSpacing ?? null,
                lineHeight: asset.lineHeight ?? null,
            });

            sideObj.texts = texts;
            sideObj.activeTextId = id;
            sideObj.activeElement = { type: "text", id };

            next.sides[side] = sideObj;
            return next;
        });

        if (steps[currentStep] === "Upload") {
            setTimeout(() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1)), 50);
        }

        const latest = { ...purchaseData };
        syncDecorations({ purchaseData: latest, setPurchaseData, product });
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
                                        {/* kurze Vorschau nach Upload/Library */}
                                        {previewUrl && !uploading && (
                                            <div className="mt-1 flex flex-col items-center gap-2">
                                                <img
                                                    src={previewUrl}
                                                    alt=""
                                                    className="h-20 lg:h-24 w-auto object-contain rounded-md shadow-sm border border-gray-200 bg-white"
                                                />
                                                {/* optional: Dateiname */}
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

                                {/* Meine Bibliothek (aus Firestore Library/Pending) */}
                                <div className="mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowLibrary((p) => !p)}
                                        className={[
                                            "w-full flex items-center justify-between",
                                            "bg-accentColor/70 border border-accentColor/50",
                                            "mt-4 px-4 py-3 rounded-2xl shadow-sm",
                                            "font-semibold text-[15px]",
                                            "transition-all hover:shadow-md",
                                        ].join(" ")}
                                    >
                                        <span>Meine Bibliothek (frühere Uploads & Texte)</span>
                                        <FiChevronDown
                                            className={[
                                                "transition-transform duration-200",
                                                showLibrary ? "rotate-180" : "rotate-0",
                                            ].join(" ")}
                                        />
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {showLibrary && (
                                            <motion.div
                                                key="lib-panel"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="bg-accentColor/40 border border-accentColor/40 rounded-2xl mt-2 px-4 pb-4 pt-3">
                                                    {/* Variante A: Dein LibraryPanel liefert onInsert(asset) */}
                                                    <LibraryPanel
                                                        activeSide={currentSide}
                                                        getCanvasSize={() => ({
                                                            width: purchaseData?.containerWidth || 800,
                                                            height: purchaseData?.containerHeight || 800,
                                                        })}
                                                        insertImage={({ url, side, x, y, scale, rotation }) =>
                                                            insertImageFromLibrary({
                                                                url,
                                                                side,
                                                                placement: { x, y, scale, rotation },
                                                            })
                                                        }
                                                        insertText={(t) =>
                                                            insertTextFromLibrary({
                                                                value: t.value,
                                                                fontFamily: t.fontFamily,
                                                                fontSize: t.fontSize,
                                                                fill: t.fill,
                                                                side: t.side,
                                                                placement: {
                                                                    x: t.x,
                                                                    y: t.y,
                                                                    scale: t.scale,
                                                                    rotation: t.rotation,
                                                                },
                                                                letterSpacing: t.letterSpacing,
                                                                lineHeight: t.lineHeight,
                                                            })
                                                        }
                                                    />

                                                    {/* 
            Variante B (falls dein LibraryPanel stattdessen onInsert(asset) hat):
            <LibraryPanel
              activeSide={currentSide}
              getCanvasSize={() => getDstCanvas()}
              onInsert={(asset) => {
                if (asset.kind === "image") insertImageFromLibrary(asset);
                else insertTextFromLibrary(asset);
              }}
            />
          */}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
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
