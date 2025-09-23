import React, { useState, useEffect, useRef, useMemo } from "react";
import { StepButton } from "@/components/buttons";
import { Tabs, Tab, Button } from "@mui/material";
import { P } from "@/components/typography";
import useStore from "@/store/store";
// import { FiX, FiType, FiImage } from "react-icons/fi";
import CustomRadioButton from "@/components/inputs/customRadioButton";
import VeredelungTable from "@/components/infoTable/veredlungsTable";
import GraphicControls from "@/components/productConfigurator/controls/graphicControls";
import TextControls from "@/components/productConfigurator/controls/textControls";
import { FiX, FiType, FiImage, FiPlus, FiSearch } from "react-icons/fi";
import uploadGraphic from "@/functions/uploadGraphic";

// FUNCTIONS
import handleFileUpload from "@/functions/handleFileUpload";
import getImagePlacement from "@/functions/getImagePlacement";
import getMaxUniformScale from "@/functions/getMaxUniformScale";
import { getFixedImagePlacement } from "@/functions/getImagePlacement";
import { centerVertically, centerHorizontally } from "@/functions/centerFunctions";
import resetScale from "@/functions/resetScale";
import useIsMobile from "@/hooks/isMobile";

import { auth } from "@/config/firebase";
import { useUserAssets } from "@/hooks/useUserAsset";

import { v4 as uuidv4 } from "uuid";

export default function ConfigureDesign({ product, setCurrentStep, steps, currentStep, veredelungen }) {
    const {
        purchaseData,
        setPurchaseData,
        selectedVariant,
        setModalOpen,
        setColorSpace,
        setModalContent,
        setDpi,
        setShowSpinner,
        isMobileSliderOpen,
        setActiveElement,
        updateText,
    } = useStore();

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);

    const boundingRect = purchaseData.boundingRect; // { x, y, width, height }
    const currentSide = purchaseData.currentSide || "front";
    const tabIndex = currentSide === "front" ? 0 : 1;
    const isMobile = useIsMobile();

    // Seite / Elemente
    const side = purchaseData.sides[currentSide] || {};
    const texts = side.texts || [];
    const uploadedGraphics = side.uploadedGraphics || [];
    const activeGraphicId = side.activeGraphicId || uploadedGraphics?.[0]?.id;
    const activeGraphic = uploadedGraphics.find((g) => g.id === activeGraphicId) || uploadedGraphics[0] || null;
    const active = side.activeElement || null;
    const activeText = active?.type === "text" ? texts.find((t) => t.id === active.id) : null;

    const containerWidth = purchaseData.containerWidth || 500;
    const containerHeight = purchaseData.containerHeight || 500;

    const printRect = purchaseData.boundingRect || { x: 0, y: 0, width: 0, height: 0 };
    const fontSizeMin = 10;
    const fontSizeMax = Math.max(200, Math.round(printRect.height * 0.35));
    const xMinText = printRect.x;
    const xMaxText = printRect.x + printRect.width;
    const yMinText = printRect.y;
    const yMaxText = printRect.y + printRect.height;

    const fileInputRef = useRef(null);
    const triggerGraphicUpload = () => fileInputRef.current?.click();

    const addFileInputRef = useRef(null);
    const triggerAddGraphic = () => addFileInputRef.current?.click();

    // use the SAME logic as Konva’s add button
    const handleAddGraphic = async (event) => {
        const newFile = event.target.files?.[0];
        if (!newFile) return;

        await uploadGraphic({
            newFile,
            currentSide: purchaseData.currentSide,
            purchaseData,
            setPurchaseData,
            setModalOpen,
            setShowSpinner,
            setModalContent,
            setUploading,
            setUploadError,
            setColorSpace,
            setDpi,
            stepAhead: true, // like in Konva
        });

        // clear input so the same file can be re-selected
        event.target.value = "";
    };

    useEffect(() => {}, [isMobileSliderOpen]);

    function getDynamicRect(sideKey) {
        const rect = purchaseData.boundingRect;
        const data = purchaseData.sides[sideKey] || {};
        if (!rect || !data.width || !data.height) return rect;

        const scale = data.scale || 1;
        const dx = (data.width / 2) * scale;
        const dy = (data.height / 2) * scale;

        return { ...rect, x: rect.x + dx, y: rect.y + dy };
    }

    useEffect(() => {
        if (!purchaseData.currentSide) {
            setPurchaseData((prevData) => ({ ...prevData, currentSide: "front" }));
        }
    }, []);

    const handleXChange = (_e, newValue) => {
        if (!activeGraphic) return;
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [currentSide]: {
                    ...prev.sides[currentSide],
                    uploadedGraphics: prev.sides[currentSide].uploadedGraphics.map((g) =>
                        g.id === activeGraphicId ? { ...g, xPosition: newValue } : g
                    ),
                },
            },
        }));
    };

    const handleYChange = (_e, newValue) => {
        if (!activeGraphic) return;
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [currentSide]: {
                    ...prev.sides[currentSide],
                    uploadedGraphics: prev.sides[currentSide].uploadedGraphics.map((g) =>
                        g.id === activeGraphicId ? { ...g, yPosition: newValue } : g
                    ),
                },
            },
        }));
    };

    const dynRect = getDynamicRect(currentSide) || { x: 0, y: 0, width: 0, height: 0 };

    const minX = printRect.x + ((activeGraphic?.width ?? 0) * (activeGraphic?.scale ?? 1)) / 2;
    const maxX = printRect.x + printRect.width - ((activeGraphic?.width ?? 0) * (activeGraphic?.scale ?? 1)) / 2;
    const minY = printRect.y + ((activeGraphic?.height ?? 0) * (activeGraphic?.scale ?? 1)) / 2;
    const maxY = printRect.y + printRect.height - ((activeGraphic?.height ?? 0) * (activeGraphic?.scale ?? 1)) / 2;

    const USE_DYNAMIC_MAX = false;
    const FIXED_MAX_SCALE = 3.0;
    let allowedMaxScale = USE_DYNAMIC_MAX ? 3.5 : FIXED_MAX_SCALE;

    const handleScaleChange = (_e, newValue) => {
        if (!activeGraphic) return;
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [currentSide]: {
                    ...prev.sides[currentSide],
                    uploadedGraphics: prev.sides[currentSide].uploadedGraphics.map((g) =>
                        g.id === activeGraphicId ? { ...g, scale: newValue } : g
                    ),
                },
            },
        }));
    };

    const handleRotationChange = (_e, newValue) => {
        if (!activeGraphic) return;
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [currentSide]: {
                    ...prev.sides[currentSide],
                    uploadedGraphics: prev.sides[currentSide].uploadedGraphics.map((g) =>
                        g.id === activeGraphicId ? { ...g, rotation: newValue } : g
                    ),
                },
            },
        }));
    };

    const handleTabChange = (_event, newIndex) => {
        const nextSide = newIndex === 0 ? "front" : "back";
        setPurchaseData((prev) => {
            const sideData = prev.sides?.[nextSide] || {};
            const firstGraphicId = sideData.uploadedGraphics?.[0]?.id ?? null;
            const firstTextId = sideData.texts?.[0]?.id ?? null;
            const nextActive = firstGraphicId
                ? { type: "graphic", id: firstGraphicId }
                : firstTextId
                ? { type: "text", id: firstTextId }
                : null;
            return {
                ...prev,
                currentSide: nextSide,
                sides: {
                    ...prev.sides,
                    [nextSide]: {
                        ...sideData,
                        activeGraphicId:
                            nextActive?.type === "graphic" ? nextActive.id : sideData.activeGraphicId ?? null,
                        activeTextId: nextActive?.type === "text" ? nextActive.id : sideData.activeTextId ?? null,
                        activeElement: nextActive,
                    },
                },
            };
        });
    };

    const handleGraphicUpload = async (event) => {
        const newFile = event.target.files[0];
        if (!newFile) return;

        await handleFileUpload({
            newFile,
            currentSide,
            purchaseData,
            setUploadedFile,
            setPurchaseData,
            setModalOpen,
            setShowSpinner,
            setModalContent,
            setUploading,
            setUploadError,
            setColorSpace,
            setDpi,
            steps,
            currentStep,
            setCurrentStep,
        });
    };

    const stepData = {
        title: purchaseData.configurator == "template" ? "Vorlage wählen" : "Platzierung",
    };

    // Positions (Template)
    const getPositions = () => {
        if (product?.fixedPositions?.value) {
            const fixed = JSON.parse(product.fixedPositions.value);
            const frontPositions = fixed
                .filter(
                    (pos) =>
                        pos.includes("Brust") ||
                        pos.includes("Oberschenkel vorne") ||
                        pos.includes("Vorne") ||
                        pos.includes("Kugelschreiber") ||
                        pos.includes("Zollstock") ||
                        pos.includes("Front")
                )
                .map((name) => ({ name, enabled: true, position: { x: 0.42, y: 0.42 } }));
            const backPositions = fixed
                .filter(
                    (pos) => pos.includes("Rücken") || pos.includes("Oberschenkel hinten") || pos.includes("Hinten")
                )
                .map((name) => ({ name, enabled: true, position: { x: 0.42, y: 0.42 } }));
            return { front: { default: frontPositions }, back: { default: backPositions } };
        }
        return product?.templatePositions ? JSON.parse(product.templatePositions.value).properties : null;
    };
    const positions = getPositions();

    useEffect(() => {
        if (!purchaseData.sides) {
            setPurchaseData((prev) => ({ ...prev, sides: { front: {} } }));
        }
    }, []);

    const handleChange = (value) => {
        setPurchaseData((prevData) => ({
            ...prevData,
            sides: {
                ...prevData.sides,
                [currentSide]: { ...prevData.sides[currentSide], position: value },
            },
        }));
    };

    useEffect(() => {
        const sideKey = purchaseData.currentSide;
        const sideData = purchaseData.sides[sideKey] || {};
        if (purchaseData.boundingRect && (sideData.xPosition == null || sideData.yPosition == null)) {
            const { x: bx, y: by, width: bw, height: bh } = purchaseData.boundingRect;
            const w = sideData.width || 120;
            const h = sideData.height || 120;
            const s = sideData.scale || 1;
            const centeredX = bx + (bw - w * s) / 2;
            const centeredY = by + (bh - h * s) / 2;

            setPurchaseData((prev) => ({
                ...prev,
                sides: {
                    ...prev.sides,
                    [sideKey]: { ...prev.sides[sideKey], xPosition: centeredX, yPosition: centeredY },
                },
            }));
        }
    }, [
        purchaseData.currentSide,
        purchaseData.boundingRect?.x,
        purchaseData.boundingRect?.y,
        purchaseData.boundingRect?.width,
        purchaseData.boundingRect?.height,
        purchaseData.sides,
    ]);

    // Active helpers
    const setTextProp = (patch) => {
        if (!activeText) return;
        updateText(currentSide, activeText.id, patch);
    };
    const handleCenterX = () => centerHorizontally({ purchaseData, setPurchaseData, currentSide });
    const handleCenterY = () => centerVertically({ purchaseData, setPurchaseData, currentSide });
    const handleResetRotation = () => {
        if (!activeGraphic) return;
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [currentSide]: {
                    ...prev.sides[currentSide],
                    uploadedGraphics: prev.sides[currentSide].uploadedGraphics.map((g) =>
                        g.id === activeGraphicId ? { ...g, rotation: 0 } : g
                    ),
                },
            },
        }));
    };
    const handleResetScaleBtn = () => resetScale({ purchaseData, setPurchaseData, currentSide });

    // Empty state check
    const noElementsCurrent = uploadedGraphics.length === 0 && texts.length === 0;

    // Front → Back Übernehmen
    const frontSide = purchaseData.sides?.front || { uploadedGraphics: [], texts: [] };
    const hasFrontStuff = (frontSide.uploadedGraphics?.length || 0) > 0 || (frontSide.texts?.length || 0) > 0;
    // NEW: Back → Front
    const backSide = purchaseData.sides?.back || { uploadedGraphics: [], texts: [] };
    const hasBackStuff = (backSide.uploadedGraphics?.length || 0) > 0 || (backSide.texts?.length || 0) > 0;

    const centerX = (purchaseData.boundingRect?.x || 0) + (purchaseData.boundingRect?.width || containerWidth) / 2;
    const centerY = (purchaseData.boundingRect?.y || 0) + (purchaseData.boundingRect?.height || containerHeight) / 2;

    const copyGraphicToCurrent = (g) => {
        const id = uuidv4();
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [currentSide]: {
                    ...prev.sides[currentSide],
                    uploadedGraphics: [
                        ...(prev.sides[currentSide].uploadedGraphics || []),
                        { ...g, id, xPosition: centerX, yPosition: centerY, rotation: 0 },
                    ],
                    activeGraphicId: id,
                    activeElement: { type: "graphic", id },
                },
            },
        }));
    };

    const copyTextToCurrent = (t) => {
        const id = uuidv4();
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [currentSide]: {
                    ...prev.sides[currentSide],
                    texts: [
                        ...(prev.sides[currentSide].texts || []),
                        { ...t, id, x: centerX, y: centerY, rotation: 0 },
                    ],
                    activeTextId: id,
                    activeElement: { type: "text", id },
                },
            },
        }));
    };

    const addCenteredText = () => {
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
                            x: centerX,
                            y: centerY,
                            fontSize: 36,
                            fontFamily: "Roboto",
                            fill: "#000",
                            scale: 1,
                            rotation: 0,
                            align: "left",
                            lineHeight: 1.2,
                            boxWidth: Math.round((prev.boundingRect?.width || 500) * 0.6),
                            padding: 4,
                            curvature: 0, // 0 = Absatz (Konva.Text); != 0 = gebogen (TextPath)
                            fontStyle: "normal", // "normal", "bold", "italic", "bold italic"
                            textDecoration: "", // "", "underline", "line-through", "underline line-through"
                            letterSpacing: 0, // e.g., 0..2
                        },
                    ],
                    activeTextId: id,
                    activeElement: { type: "text", id },
                },
            },
        }));
    };

    // --- Library (Meine Grafiken) ---
    const uid = auth.currentUser?.uid ?? null;
    const { images: assetsImages = [], loading: assetsLoading } = useUserAssets(uid);

    // map to what our insert handler expects
    const libImages = useMemo(
        () =>
            (assetsImages || []).map((i) => ({
                id: i.id || i._id || i.url,
                url: i.url,
                name: i.filename || i.productTitle || i.name || "Grafik",
            })),
        [assetsImages]
    );

    const [libOpen, setLibOpen] = useState(false);
    const libraryWrapRef = useRef(null);
    const openLibrary = () => setLibOpen((v) => !v);

    const measureBlob = (blob) =>
        new Promise((resolve) => {
            const url = URL.createObjectURL(blob);
            const img = new window.Image();
            img.onload = () => {
                resolve({ w: img.width, h: img.height });
                URL.revokeObjectURL(url);
            };
            img.onerror = () => {
                resolve(null);
                URL.revokeObjectURL(url);
            };
            img.src = url;
        });

    const insertGraphicFromLibrary = async (asset) => {
        if (!asset?.url) return;

        // 1) URL -> Blob (matches KonvaLayer behavior)
        let blob;
        try {
            const res = await fetch(asset.url, { mode: "cors", cache: "no-store" });
            if (!res.ok) throw new Error("fetch failed");
            blob = await res.blob();
        } catch (e) {
            console.error("Konnte Library-Grafik nicht laden:", e);
            return;
        }

        // 2) natural size
        const dims = await measureBlob(blob);
        if (!dims) return;

        // 3) placement (same logic as KonvaLayer)
        const hasKonfig = !!(purchaseData?.product?.konfigBox && purchaseData.product.konfigBox.value);
        const placement = hasKonfig
            ? getFixedImagePlacement({
                  imageNaturalWidth: dims.w,
                  imageNaturalHeight: dims.h,
                  boundingRect: purchaseData.boundingRect,
                  centerImage: true,
              })
            : getImagePlacement({
                  containerWidth,
                  containerHeight,
                  imageNaturalWidth: dims.w,
                  imageNaturalHeight: dims.h,
              });

        const { finalWidth, finalHeight, x, y } = placement;
        const id = uuidv4();

        // 4) push into current side, centered & active
        setPurchaseData((prev) => {
            const sideKey = prev.currentSide || "front";
            const side = { ...(prev.sides?.[sideKey] || {}) };
            const arr = Array.isArray(side.uploadedGraphics) ? [...side.uploadedGraphics] : [];

            const cx = (x ?? (prev.boundingRect?.x || 0)) + finalWidth / 2;
            const cy = (y ?? (prev.boundingRect?.y || 0)) + finalHeight / 2;

            arr.push({
                id,
                type: "upload",
                name: asset.name || null,
                file: blob, // triggers objectURL in Konva layer
                downloadURL: asset.url,
                url: asset.url,
                xPosition: cx,
                yPosition: cy,
                width: finalWidth, // key: do NOT use natural size
                height: finalHeight,
                scale: 1,
                rotation: 0,
            });

            side.uploadedGraphics = arr;
            side.activeGraphicId = id;
            side.activeElement = { type: "graphic", id };

            return { ...prev, sides: { ...prev.sides, [sideKey]: side } };
        });
    };

    return (
        <div className="flex flex-col lg:px-16 lg:mt-4 2xl:my-8 font-body ">
            {/* Tabs */}
            {/* <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                aria-label="Product side tabs"
                centered={isMobile}
                className="mb-8 font-body text-xl !hidden lg:!flex"
                style={{ color: "#4f46e5", textAlign: "center" }}
                sx={{
                    "& .MuiTabs-indicator": { backgroundColor: "#ba979d" },
                    "& .Mui-selected": { color: "#393836!important", fontWeight: "bold" },
                    "& .MuiTab-root": { minWidth: 0, padding: "0.75rem 1.5rem", transition: "color 0.3s" },
                }}
            >
                <Tab label="Vorderseite" className="text-xl font-semibold" />
                {selectedVariant?.backImageUrl && <Tab label="Rückseite" className="text-lg font-semibold" />}
            </Tabs> */}
            {/* Top toolbar: side switch + CTAs */}
            {/* Top toolbar: side switch + compact CTAs */}
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur px-4 py-3 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    {/* Segmented tabs – visually distinct from buttons */}
                    <div className="inline-flex overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">
                        <button
                            type="button"
                            onClick={() => handleTabChange(null, 0)}
                            className={[
                                "px-4 py-2 text-sm font-medium transition",
                                currentSide === "front"
                                    ? "bg-primaryColor-50 text-primaryColor-700"
                                    : "text-gray-600 hover:bg-gray-50",
                            ].join(" ")}
                            aria-pressed={currentSide === "front"}
                        >
                            Vorderseite
                        </button>

                        {selectedVariant?.backImageUrl && (
                            <button
                                type="button"
                                onClick={() => handleTabChange(null, 1)}
                                className={[
                                    "px-4 py-2 text-sm font-medium transition border-l border-gray-200",
                                    currentSide === "back"
                                        ? "bg-primaryColor-50 text-primaryColor-700"
                                        : "text-gray-600 hover:bg-gray-50",
                                ].join(" ")}
                                aria-pressed={currentSide === "back"}
                            >
                                Rückseite
                            </button>
                        )}
                    </div>

                    {/* CTAs: smaller, lively “+” buttons */}
                    <div className="flex gap-2">
                        {/* Add Graphic — uses Konva logic */}
                        <button
                            type="button"
                            onClick={triggerAddGraphic}
                            className="group inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm hover:border-primaryColor-300 hover:bg-primaryColor-50 active:scale-[0.98] transition"
                            title="Grafik hinzufügen"
                        >
                            <span className="grid h-5 w-5 place-items-center rounded-md bg-textColor text-white transition group-hover:bg-primaryColor-600">
                                <FiPlus className="text-[12px]" />
                            </span>
                            <FiImage className="opacity-70" />
                            Grafik
                        </button>

                        <input
                            ref={addFileInputRef}
                            type="file"
                            hidden
                            accept="image/*,application/pdf"
                            onChange={handleAddGraphic}
                        />

                        {/* Add Text */}
                        <button
                            type="button"
                            onClick={addCenteredText}
                            className="group inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm hover:border-primaryColor-300 hover:bg-primaryColor-50 active:scale-[0.98] transition"
                            title="Text hinzufügen"
                        >
                            <span className="grid h-5 w-5 place-items-center rounded-md bg-textColor text-white transition group-hover:bg-primaryColor-600">
                                <FiPlus className="text-[12px]" />
                            </span>
                            <FiType className="opacity-70" />
                            Text
                        </button>
                        {/* Meine Grafiken (Library) */}
                        <div ref={libraryWrapRef} className="relative">
                            <button
                                type="button"
                                onClick={openLibrary}
                                className="group inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm hover:border-primaryColor-300 hover:bg-primaryColor-50 active:scale-[0.98] transition"
                                title="Meine Grafiken"
                                aria-expanded={libOpen}
                            >
                                <span className="grid h-5 w-5 place-items-center rounded-md bg-[#ba979d] text-white transition group-hover:bg-primaryColor-600">
                                    <FiSearch className="text-[12px]" />
                                </span>
                                <span className="opacity-80">Bibliothek</span>
                            </button>

                            {libOpen && (
                                <div
                                    className="absolute z-50 top-10 w-64 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
                                    role="dialog"
                                    aria-label="Meine Grafiken"
                                >
                                    <div className="flex items-center justify-between mb-1 px-1">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <FiSearch /> <span>Meine Grafiken</span>
                                        </div>
                                        <button
                                            className="p-1 rounded hover:bg-gray-100"
                                            onClick={() => setLibOpen(false)}
                                            title="Schließen"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    </div>

                                    {assetsLoading ? (
                                        <div className="text-sm text-gray-500 px-1 py-2">Lade …</div>
                                    ) : libImages.length === 0 ? (
                                        <div className="text-xs text-gray-500 px-1 py-2">Keine Grafiken gefunden.</div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {libImages.map((a) => (
                                                <button
                                                    key={a.id}
                                                    onClick={() => insertGraphicFromLibrary(a)}
                                                    className="flex items-center gap-3 border rounded-lg p-2 hover:bg-[#f7f2f4] transition text-left"
                                                    title={a.name || "Grafik"}
                                                >
                                                    <img
                                                        src={a.url}
                                                        alt={a.name || "Grafik"}
                                                        className="w-12 h-12 object-contain rounded border"
                                                    />
                                                    <span className="text-xs text-gray-800 truncate">
                                                        {a.name || "Grafik"}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Steuerbereich */}
            {purchaseData.configurator === "template" ? (
                <div className="flex flex-wrap lg:mb-4">
                    {positions?.[currentSide]?.default?.map((option, index) => (
                        <CustomRadioButton
                            key={`radio${index}`}
                            id={option.name}
                            name="custom-radio-group"
                            label={option.name}
                            icon={option.icon}
                            value={option.name}
                            product={product}
                            checked={purchaseData.sides[currentSide]?.position === option.name}
                            onChange={() => handleChange(option.name, option.position.x, option.position.y)}
                        />
                    ))}
                </div>
            ) : noElementsCurrent ? (
                <div className="flex gap-3">
                    <Button
                        variant="contained"
                        component="label"
                        sx={{
                            mt: 1.5,
                            px: 3,
                            py: 1,
                            backgroundColor: "#ba979d",
                            color: "white",
                            borderRadius: "8px",
                            boxShadow: "none",
                            "&:hover": { backgroundColor: "primaryColor.light" },
                        }}
                        startIcon={<FiImage />}
                    >
                        Datei hochladen
                        <input type="file" hidden onChange={handleGraphicUpload} accept="image/*,application/pdf" />
                    </Button>

                    <Button
                        variant="contained"
                        sx={{
                            mt: 1.5,
                            px: 3,
                            py: 1,
                            backgroundColor: "#393836",
                            color: "white",
                            borderRadius: "8px",
                            boxShadow: "none",
                            "&:hover": { backgroundColor: "#2c2b29" },
                        }}
                        startIcon={<FiType />}
                        onClick={addCenteredText}
                    >
                        Text hinzufügen
                    </Button>
                </div>
            ) : (
                <>
                    {active?.type === "text" ? (
                        <TextControls
                            textObj={activeText}
                            setTextProp={setTextProp}
                            xMin={xMinText}
                            xMax={xMaxText}
                            yMin={yMinText}
                            yMax={yMaxText}
                            sizeMin={fontSizeMin}
                            sizeMax={fontSizeMax}
                        />
                    ) : (
                        <GraphicControls
                            activeGraphic={activeGraphic}
                            minX={minX}
                            maxX={maxX}
                            minY={minY}
                            maxY={maxY}
                            allowedMaxScale={allowedMaxScale}
                            onX={handleXChange}
                            onY={handleYChange}
                            onRotation={handleRotationChange}
                            onScale={handleScaleChange}
                            onCenterX={centerHorizontally && (() => handleCenterX())}
                            onCenterY={centerVertically && (() => handleCenterY())}
                            onResetRotation={handleResetRotation}
                            onResetScale={handleResetScaleBtn}
                        />
                    )}
                </>
            )}

            {/* Rückseite: Von der Vorderseite übernehmen */}
            {purchaseData.configurator !== "template" && currentSide === "back" && hasFrontStuff && (
                <div className="mt-8">
                    <P klasse="!text-sm 2xl:!text-base !mb-2">Von der Vorderseite übernehmen</P>
                    <div className="flex flex-wrap gap-4">
                        {(frontSide.uploadedGraphics || []).map((g) => (
                            <button
                                key={`fg-${g.id}`}
                                className="flex items-center gap-2 p-2 rounded-2xl border border-[#ececec] bg-white hover:bg-[#f7f2f4] transition"
                                onClick={() => copyGraphicToCurrent(g)}
                                title="Grafik auf Rückseite kopieren"
                            >
                                <img
                                    className="max-h-20 max-w-20 rounded-xl border border-[#e0d0d0] object-contain"
                                    src={g.file instanceof Blob ? URL.createObjectURL(g.file) : g.downloadURL || ""}
                                    alt="Front-Grafik"
                                />
                                <span className="text-xs">Übernehmen</span>
                            </button>
                        ))}

                        {(frontSide.texts || []).map((t) => (
                            <button
                                key={`ft-${t.id}`}
                                className="flex items-center gap-2 p-2 rounded-2xl border border-[#ececec] bg-white hover:bg-[#f7f2f4] transition"
                                onClick={() => copyTextToCurrent(t)}
                                title={`"${t.value || "Text"}" auf Rückseite kopieren`}
                            >
                                <div className="w-20 h-20 rounded-xl border border-[#e0d0d0] grid place-items-center">
                                    <FiType size={28} />
                                </div>
                                <span className="text-xs max-w-[10rem] truncate">{t.value || "Text"}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Vorderseite: Von der Rückseite übernehmen */}
            {purchaseData.configurator !== "template" && currentSide === "front" && hasBackStuff && (
                <div className="mt-8">
                    <P klasse="!text-sm 2xl:!text-base !mb-2">Von der Rückseite übernehmen</P>

                    <div className="flex flex-wrap gap-4">
                        {/* Grafiken von der Rückseite */}
                        {(backSide.uploadedGraphics || []).map((g) => {
                            const thumbSrc =
                                g.isPDF && g.preview
                                    ? g.preview
                                    : g.file instanceof Blob
                                    ? URL.createObjectURL(g.file)
                                    : g.downloadURL || "";

                            return (
                                <button
                                    key={`bg-${g.id}`}
                                    className="flex items-center gap-2 p-2 rounded-2xl border border-[#ececec] bg-white hover:bg-[#f7f2f4] transition"
                                    onClick={() => copyGraphicToCurrent(g)}
                                    title="Grafik auf Vorderseite kopieren"
                                >
                                    <img
                                        className="max-h-20 max-w-20 rounded-xl border border-[#e0d0d0] object-contain"
                                        src={thumbSrc}
                                        alt="Back-Grafik"
                                    />
                                    <span className="text-xs">Übernehmen</span>
                                </button>
                            );
                        })}

                        {/* Texte von der Rückseite */}
                        {(backSide.texts || []).map((t) => (
                            <button
                                key={`bt-${t.id}`}
                                className="flex items-center gap-2 p-2 rounded-2xl border border-[#ececec] bg-white hover:bg-[#f7f2f4] transition"
                                onClick={() => copyTextToCurrent(t)}
                                title={`"${t.value || "Text"}" auf Vorderseite kopieren`}
                            >
                                <div className="w-20 h-20 rounded-xl border border-[#e0d0d0] grid place-items-center">
                                    <FiType size={28} />
                                </div>
                                <span className="text-xs max-w-[10rem] truncate">{t.value || "Text"}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Veredelungstabelle */}
            <div className="info w-full lg:will-change-auto">
                {!product?.preisModell?.value.includes("Alles inklusive") && (
                    <VeredelungTable brustData={veredelungen.front} rueckenData={veredelungen.back} />
                )}
            </div>

            {/* Previews der aktuellen Seite */}
            {(uploadedGraphics.length > 0 || texts.length > 0) && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 lg:gap-4">
                    {/* Grafiken */}
                    {uploadedGraphics.map((g) => {
                        const isActiveGraphic = activeGraphicId === g.id && active?.type !== "text";
                        const thumbSrc =
                            g.isPDF && g.preview
                                ? g.preview
                                : g.file instanceof Blob
                                ? URL.createObjectURL(g.file)
                                : g.downloadURL || "";

                        return (
                            <button
                                key={g.id}
                                type="button"
                                onClick={() =>
                                    setPurchaseData((prev) => ({
                                        ...prev,
                                        sides: {
                                            ...prev.sides,
                                            [currentSide]: {
                                                ...prev.sides[currentSide],
                                                activeGraphicId: g.id,
                                                activeElement: { type: "graphic", id: g.id },
                                            },
                                        },
                                    }))
                                }
                                className={[
                                    "group relative overflow-hidden rounded-2xl border bg-white shadow-sm",
                                    "aspect-square grid place-items-center transition-all",
                                    "hover:shadow-md hover:border-primaryColor-300/70",
                                    isActiveGraphic
                                        ? "ring-4 ring-primaryColor/60 border-primaryColor"
                                        : "border-gray-200",
                                ].join(" ")}
                                title={g.file?.name || "Grafik"}
                            >
                                {/* Delete */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPurchaseData((prev) => {
                                            const next = prev.sides[currentSide].uploadedGraphics.filter(
                                                (gg) => gg.id !== g.id
                                            );
                                            const wasActive =
                                                prev.sides[currentSide].activeGraphicId === g.id &&
                                                prev.sides[currentSide].activeElement?.type === "graphic";
                                            return {
                                                ...prev,
                                                sides: {
                                                    ...prev.sides,
                                                    [currentSide]: {
                                                        ...prev.sides[currentSide],
                                                        uploadedGraphics: next,
                                                        activeGraphicId: wasActive
                                                            ? next[0]?.id || null
                                                            : prev.sides[currentSide].activeGraphicId,
                                                        activeElement: wasActive
                                                            ? texts[0]
                                                                ? { type: "text", id: texts[0].id }
                                                                : next[0]
                                                                ? { type: "graphic", id: next[0].id }
                                                                : null
                                                            : prev.sides[currentSide].activeElement,
                                                    },
                                                },
                                            };
                                        });
                                        if (g.file instanceof Blob && thumbSrc?.startsWith("blob:")) {
                                            setTimeout(() => {
                                                try {
                                                    URL.revokeObjectURL(thumbSrc);
                                                } catch {}
                                            }, 1500);
                                        }
                                    }}
                                    className="absolute top-2 right-2 z-10 rounded-full p-1.5 text-white bg-red-600/90 hover:bg-red-700 shadow"
                                    aria-label="Grafik löschen"
                                >
                                    <FiX size={14} />
                                </button>

                                {/* Thumb */}
                                {thumbSrc ? (
                                    <img
                                        src={thumbSrc}
                                        alt="Preview"
                                        className="pointer-events-none h-[78%] w-[78%] object-contain rounded-md"
                                    />
                                ) : (
                                    <div className="h-[78%] w-[78%] grid place-items-center text-xs text-gray-600">
                                        Vorschau fehlt
                                    </div>
                                )}

                                {/* Caption */}
                                <div className="absolute bottom-0 left-0 right-0 bg-white/85 backdrop-blur-sm border-t border-gray-200 px-2 py-1">
                                    <p className="text-[11px] text-gray-700 truncate">{g.file?.name || "Grafik"}</p>
                                </div>
                            </button>
                        );
                    })}

                    {/* Texte */}
                    {texts.map((t) => {
                        const isActiveText = active?.type === "text" && active.id === t.id;
                        return (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setActiveElement(currentSide, "text", t.id)}
                                className={[
                                    "group relative overflow-hidden rounded-2xl border bg-white shadow-sm",
                                    "aspect-square grid place-items-center transition-all",
                                    "hover:shadow-md hover:border-primaryColor-300/70",
                                    isActiveText
                                        ? "ring-4 ring-primaryColor/60 border-primaryColor"
                                        : "border-gray-200",
                                ].join(" ")}
                                title={t.value || "Text"}
                            >
                                {/* Delete */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPurchaseData((prev) => {
                                            const nextTexts = prev.sides[currentSide].texts.filter(
                                                (tt) => tt.id !== t.id
                                            );
                                            const wasActiveText =
                                                prev.sides[currentSide].activeElement?.type === "text" &&
                                                prev.sides[currentSide].activeElement?.id === t.id;

                                            const nextActive = wasActiveText
                                                ? nextTexts[0]
                                                    ? { type: "text", id: nextTexts[0].id }
                                                    : uploadedGraphics[0]
                                                    ? { type: "graphic", id: uploadedGraphics[0].id }
                                                    : null
                                                : prev.sides[currentSide].activeElement;

                                            return {
                                                ...prev,
                                                sides: {
                                                    ...prev.sides,
                                                    [currentSide]: {
                                                        ...prev.sides[currentSide],
                                                        texts: nextTexts,
                                                        activeTextId: wasActiveText
                                                            ? nextTexts[0]?.id || null
                                                            : prev.sides[currentSide].activeTextId,
                                                        activeElement: nextActive,
                                                    },
                                                },
                                            };
                                        });
                                    }}
                                    className="absolute top-2 right-2 z-10 rounded-full p-1.5 text-white bg-red-600/90 hover:bg-red-700 shadow"
                                    aria-label="Text löschen"
                                >
                                    <FiX size={14} />
                                </button>

                                {/* Text-Thumb */}
                                <div
                                    className={[
                                        "h-[78%] w-[78%] rounded-md border grid place-items-center",
                                        "bg-white text-gray-900",
                                        "border-gray-200 group-hover:border-primaryColor-300/70",
                                    ].join(" ")}
                                >
                                    <span className="px-2 text-sm text-center line-clamp-3 leading-snug">
                                        {t.value || "Text"}
                                    </span>
                                </div>

                                {/* Caption */}
                                <div className="absolute bottom-0 left-0 right-0 bg-white/85 backdrop-blur-sm border-t border-gray-200 px-2 py-1">
                                    <p className="text-[11px] text-gray-700 truncate">{t.value || "Text"}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
