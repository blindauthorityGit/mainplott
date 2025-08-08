import React, { useState, useEffect } from "react";
import { Tabs, Tab, Button, Checkbox, FormControlLabel } from "@mui/material";
import { P } from "@/components/typography";
import useStore from "@/store/store";
import ContentWrapper from "../components/contentWrapper";
import { FiX, FiType, FiImage } from "react-icons/fi";
import { IconButton } from "@/components/buttons";
import CustomRadioButton from "@/components/inputs/customRadioButton";
import VeredelungTable from "@/components/infoTable/veredlungsTable";
import GraphicControls from "@/components/productConfigurator/controls/GraphicControls";
import TextControls from "@/components/productConfigurator/controls/TextControls";

// FUNCTIONS
import handleFileUpload from "@/functions/handleFileUpload";
import getImagePlacement from "@/functions/getImagePlacement";
import getMaxUniformScale from "@/functions/getMaxUniformScale";
import { getFixedImagePlacement } from "@/functions/getImagePlacement";
import { centerVertically, centerHorizontally } from "@/functions/centerFunctions";
import resetScale from "@/functions/resetScale";
import useIsMobile from "@/hooks/isMobile";

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
    const fontSizeMax = Math.round(printRect.height * 0.6);
    const xMinText = printRect.x;
    const xMaxText = printRect.x + printRect.width;
    const yMinText = printRect.y;
    const yMaxText = printRect.y + printRect.height;

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
        setPurchaseData({ ...purchaseData, currentSide: newIndex === 0 ? "front" : "back" });
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
                        },
                    ],
                    activeTextId: id,
                    activeElement: { type: "text", id },
                },
            },
        }));
    };

    return (
        <div className="flex flex-col lg:px-16 lg:mt-4 2xl:mt-8 font-body ">
            {/* Header */}
            {/* {steps[currentStep] === "Design" && isMobile ? null : <ContentWrapper data={stepData} showToggle />} */}

            {/* Tabs */}
            <Tabs
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
            </Tabs>

            {/* --- Steuerbereich --- */}
            {purchaseData.configurator === "template" ? (
                // TEMPLATE: Radio-Buttons (bleibt!)
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
                // FREIE PLATZIERUNG: Leerer Zustand → zwei CTAs
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
                // FREIE PLATZIERUNG: Controls für aktives Element
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

            {/* Veredelungstabelle */}
            <div className="info w-full lg:will-change-auto">
                {!product?.preisModell?.value.includes("Alles inklusive") && (
                    <VeredelungTable brustData={veredelungen.front} rueckenData={veredelungen.back} />
                )}
            </div>

            {/* Previews der AKTUELLEN Seite (Grafiken + Texte) */}
            {uploadedGraphics.length > 0 || texts.length > 0 ? (
                <div className="flex flex-wrap gap-4 mt-6">
                    {/* Grafiken */}
                    {uploadedGraphics.map((g) => (
                        <div
                            key={g.id}
                            className={`flex items-top gap-2 p-2 rounded-2xl border border-[#ececec] ${
                                activeGraphicId === g.id && active?.type !== "text" ? "bg-[#f3e9ec] shadow" : "bg-white"
                            }`}
                            style={{ minWidth: 100 }}
                        >
                            <img
                                className="max-h-20 max-w-20 rounded-xl border border-[#e0d0d0] object-contain cursor-pointer"
                                src={g.file instanceof Blob ? URL.createObjectURL(g.file) : g.downloadURL || ""}
                                alt="Preview"
                                onClick={() => {
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
                                    }));
                                }}
                                style={{
                                    border:
                                        activeGraphicId === g.id && active?.type !== "text"
                                            ? "2px solid #ba979d"
                                            : undefined,
                                }}
                            />
                            <div className="flex flex-col gap-1">
                                <IconButton
                                    onClick={() => {
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
                                    }}
                                    icon={FiX}
                                    label="Löschen"
                                    bgColor="bg-errorColor"
                                    hoverColor="hover:bg-red-600"
                                    textColor="text-white"
                                />
                            </div>
                        </div>
                    ))}

                    {/* Texte */}
                    {texts.map((t) => {
                        const isActiveText = active?.type === "text" && active.id === t.id;
                        return (
                            <div
                                key={t.id}
                                className={`flex items-center gap-2 p-2 rounded-2xl border border-[#ececec] ${
                                    isActiveText ? "bg-[#f3e9ec] shadow" : "bg-white"
                                }`}
                                style={{ minWidth: 100 }}
                            >
                                <button
                                    className="w-20 h-20 rounded-xl border border-[#e0d0d0] grid place-items-center cursor-pointer"
                                    onClick={() => setActiveElement(currentSide, "text", t.id)}
                                    title={t.value}
                                    style={{ border: isActiveText ? "2px solid #ba979d" : undefined }}
                                >
                                    <FiType size={28} />
                                </button>

                                <div className="flex flex-col gap-1">
                                    <span className="text-xs max-w-[10rem] truncate" title={t.value}>
                                        {t.value || "Text"}
                                    </span>

                                    <IconButton
                                        onClick={() => {
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
                                        icon={FiX}
                                        label="Löschen"
                                        bgColor="bg-errorColor"
                                        hoverColor="hover:bg-red-600"
                                        textColor="text-white"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
