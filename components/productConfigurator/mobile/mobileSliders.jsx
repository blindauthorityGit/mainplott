import React, { useState, useEffect } from "react";
import { Slider } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiZoomIn,
    FiBold,
    FiItalic,
    FiAlignLeft,
    FiAlignCenter,
    FiAlignRight,
    FiDroplet,
    FiMinimize,
    FiArrowUp,
    FiGitCommit,
    FiRotateCcw,
    FiMaximize,
    FiTrash2,
    FiType,
} from "react-icons/fi";
import { TbTypography } from "react-icons/tb"; // NEW: Style main icon
import { LuUnderline } from "react-icons/lu"; // NEW: Underline icon
import useStore from "@/store/store";
import { AVAILABLE_FONTS } from "@/config/fonts";

export default function MobileSliders({ zoomLevel, setZoomLevel, onDeleteActive }) {
    const { purchaseData, setPurchaseData, openMobileSlider, closeMobileSlider } = useStore();

    // ---- UI State ------------------------------------------------------------
    const [activeKey, setActiveKey] = useState(null); // aktuell geöffnetes Bottom-Sheet (Zoom/Scale/X/Y/Rotation/FontSize/FontFamily)
    const [showAlignFan, setShowAlignFan] = useState(false);
    const [showStyleFan, setShowStyleFan] = useState(false); // B/I/U
    const [showColorPopover, setShowColorPopover] = useState(false);
    const [colorValue, setColorValue] = useState("#000000");

    // Wenn ein Sheet aufgeht → andere Popover schließen
    useEffect(() => {
        if (activeKey) {
            setShowAlignFan(false);
            setShowStyleFan(false);
            setShowColorPopover(false);
        }
    }, [activeKey]);

    const currentSide = purchaseData.currentSide || "front";
    const side = purchaseData.sides?.[currentSide] || {};

    const { containerWidth = 0, containerHeight = 0, printRectRaw, boundingRect } = purchaseData;
    const centerRect = printRectRaw || boundingRect || { x: 0, y: 0, width: containerWidth, height: containerHeight };
    const centerX = centerRect.x + centerRect.width / 2;
    const centerY = centerRect.y + centerRect.height / 2;

    const active = side.activeElement || null;
    const activeGraphicId = side.activeGraphicId;
    const activeGraphic = (side.uploadedGraphics || []).find((g) => g.id === activeGraphicId) || null;
    const activeText = active?.type === "text" ? (side.texts || []).find((t) => t.id === active.id) : null;

    // Bottom-Sheet sichtbar halten, wenn activeKey gesetzt; sonst schließen
    useEffect(() => {
        activeKey ? openMobileSlider() : closeMobileSlider();
    }, [activeKey, openMobileSlider, closeMobileSlider]);

    // Falls aktives Element verschwindet → alles schließen
    useEffect(() => {
        if (!active) {
            setActiveKey(null);
            setShowAlignFan(false);
            setShowStyleFan(false);
            setShowColorPopover(false);
        }
    }, [active]);

    // ---- Helpers: Store-Updates ---------------------------------------------
    const patchGraphic = (patch) => {
        if (!activeGraphic) return;
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [currentSide]: {
                    ...prev.sides[currentSide],
                    uploadedGraphics: prev.sides[currentSide].uploadedGraphics.map((g) =>
                        g.id === activeGraphic.id ? { ...g, ...patch } : g
                    ),
                },
            },
        }));
    };

    const patchText = (patch) => {
        if (!activeText) return;
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [currentSide]: {
                    ...prev.sides[currentSide],
                    texts: (prev.sides[currentSide].texts || []).map((t) =>
                        t.id === activeText.id ? { ...t, ...patch } : t
                    ),
                },
            },
        }));
    };

    const handleReset = () => {
        setZoomLevel(1);
        if (active?.type === "text") {
            patchText({ x: centerX, y: centerY, scale: 1, rotation: 0 });
        } else if (activeGraphic) {
            patchGraphic({ xPosition: centerX, yPosition: centerY, scale: 1, rotation: 0 });
        }
        setActiveKey(null);
        setShowAlignFan(false);
        setShowStyleFan(false);
        setShowColorPopover(false);
    };

    // ---- Aktuelle Werte ------------------------------------------------------
    const valScale = activeGraphic?.scale ?? activeText?.scale ?? 1;
    const valX = activeGraphic?.xPosition ?? activeText?.x ?? containerWidth / 2;
    const valY = activeGraphic?.yPosition ?? activeText?.y ?? containerHeight / 2;
    const valRot = activeGraphic?.rotation ?? activeText?.rotation ?? 0;

    // helper: merge "bold" + "italic"
    const nextFontStyle = (cur, toggle) => {
        const parts = new Set((cur || "normal").split(" ").filter(Boolean));
        if (toggle === "bold") parts.has("bold") ? parts.delete("bold") : parts.add("bold");
        if (toggle === "italic") parts.has("italic") ? parts.delete("italic") : parts.add("italic");
        return parts.size ? Array.from(parts).join(" ") : "normal";
    };

    const toggleUnderline = () => {
        // robust: immer von vorhandenem Wert ausgehen
        const cur = activeText?.textDecoration || "";
        const has = /\bunderline\b/.test(cur);
        const next = has ? cur.replace(/\bunderline\b/, "").trim() : `${cur} underline`.trim();
        patchText({ textDecoration: next || "none" });
    };

    // ---- Controls ------------------------------------------------------------
    const openSheetKeys = new Set(["zoom", "scale", "x", "y", "rotation", "fontSize", "fontFamily"]);
    const willOpenSheet = (key) => openSheetKeys.has(key);

    const graphicControls = [
        {
            key: "zoom",
            icon: FiZoomIn,
            label: "Zoom",
            min: 1,
            max: 3,
            value: zoomLevel,
            onChange: (_e, v) => setZoomLevel(v),
        },
        {
            key: "scale",
            icon: FiMinimize,
            label: "Größe",
            min: 0.3,
            max: 3.5,
            value: valScale,
            onChange: (_e, v) => patchGraphic({ scale: v }),
        },
        {
            key: "x",
            icon: FiGitCommit,
            label: "X",
            min: 0,
            max: containerWidth,
            value: valX,
            onChange: (_e, v) => patchGraphic({ xPosition: v }),
        },
        {
            key: "y",
            icon: FiArrowUp,
            label: "Y",
            min: 0,
            max: containerHeight,
            value: valY,
            onChange: (_e, v) => patchGraphic({ yPosition: v }),
        },
        {
            key: "rotation",
            icon: FiRotateCcw,
            label: "Rotation",
            min: -180,
            max: 180,
            value: valRot,
            onChange: (_e, v) => patchGraphic({ rotation: v }),
        },
        { key: "reset", icon: FiMaximize, label: "Reset", onClick: handleReset },
        {
            key: "delete",
            icon: FiTrash2,
            label: "Löschen",
            onClick: () => {
                onDeleteActive?.();
                setActiveKey(null);
                setShowAlignFan(false);
                setShowStyleFan(false);
                setShowColorPopover(false);
            },
        },
    ];

    const textControls = [
        {
            key: "zoom",
            icon: FiZoomIn,
            label: "Zoom",
            min: 1,
            max: 3,
            value: zoomLevel,
            onChange: (_e, v) => setZoomLevel(v),
        },
        {
            key: "fontSize",
            icon: FiMinimize,
            label: "Größe",
            min: 10,
            max: 200,
            value: activeText?.fontSize || 36,
            onChange: (_e, v) => patchText({ fontSize: v }),
        },

        // Style-Fan (B/I/U) unter einem Hauptbutton
        {
            key: "styleFan",
            icon: TbTypography,
            label: "Stil",
            onClick: () => {
                setActiveKey(null);
                setShowAlignFan(false);
                setShowColorPopover(false);
                setShowStyleFan((v) => !v);
            },
        },

        {
            key: "alignFan",
            icon: FiAlignCenter,
            label: "Ausrichten",
            onClick: () => {
                setActiveKey(null);
                setShowStyleFan(false);
                setShowColorPopover(false);
                setShowAlignFan((v) => !v);
            },
        },
        {
            key: "fontFamily",
            icon: FiType,
            label: "Schriftart",
            onClick: () => {
                setShowAlignFan(false);
                setShowStyleFan(false);
                setShowColorPopover(false);
                setActiveKey("fontFamily");
            },
        },
        {
            key: "color",
            icon: FiDroplet,
            label: "Farbe",
            onClick: () => {
                const start = activeText?.fill || "#000000";
                setColorValue(start);
                setActiveKey(null);
                setShowAlignFan(false);
                setShowStyleFan(false);
                setShowColorPopover((v) => !v);
            },
        },
        { key: "reset", icon: FiMaximize, label: "Reset", onClick: handleReset },
        {
            key: "delete",
            icon: FiTrash2,
            label: "Löschen",
            onClick: () => {
                onDeleteActive?.();
                setActiveKey(null);
                setShowAlignFan(false);
                setShowStyleFan(false);
                setShowColorPopover(false);
            },
        },
    ];

    const controls = active?.type === "text" ? textControls : graphicControls;

    const sliderSX = {
        "& .MuiSlider-track": { bgcolor: "#ba979d" },
        "& .MuiSlider-thumb": { bgcolor: "#393836", border: "2px solid white" },
        "& .MuiSlider-rail": { bgcolor: "#E0E0E0" },
    };

    const activeControl = activeKey ? controls.find((c) => c.key === activeKey) : null;
    const showOnlyZoom = !active;
    const visibleControls = showOnlyZoom ? controls.filter((c) => c.key === "zoom") : controls;

    // ---- Positionierung & Zentrierung ----------------------------------------
    const TRIGGER_BTN = 41; // ~ Button-Durchmesser
    const V_GAP = 8; // vertical gap in der Button-Spalte
    const FAN_BTN = 41; // Einzel-Buttonhöhe in Popovers
    const FAN_GAP = 8; // gap-2 in Popovers
    const CONTAINER_PADDING = 16; // p-2 oben+unten

    const triggerTopByIndex = (key) => {
        const idx = Math.max(
            0,
            visibleControls.findIndex((c) => c.key === key)
        );
        return idx * (TRIGGER_BTN + V_GAP);
    };

    const centeredTopForFan = (key, items) => {
        const triggerTop = triggerTopByIndex(key);
        const fanHeight = items * FAN_BTN + (items - 1) * FAN_GAP + CONTAINER_PADDING;
        return triggerTop + TRIGGER_BTN / 2 - fanHeight / 2;
    };

    const centeredTopForColor = (key) => {
        const triggerTop = triggerTopByIndex(key);
        const colorHeight = 36 /* input */ + CONTAINER_PADDING; // ≈ h-9 + padding
        return triggerTop + TRIGGER_BTN / 2 - colorHeight / 2;
    };

    const styleTop = centeredTopForFan("styleFan", 3);
    const fanTop = centeredTopForFan("alignFan", 3);
    const colorTop = centeredTopForColor("color");

    // Animation: slide in (right -> left), slide out (left -> right)
    const popoverAnim = {
        initial: { opacity: 0, x: 16 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 16 },
        transition: { duration: 0.18, ease: "easeOut" },
    };

    // Aktive Styles (kleine Hervorhebung)
    const isBold = /\bbold\b/.test(activeText?.fontStyle || "");
    const isItalic = /\bitalic\b/.test(activeText?.fontStyle || "");
    const isUnder = /\bunderline\b/.test(activeText?.textDecoration || "");

    return (
        <>
            {/* Floating Buttons rechts */}
            <div className="absolute top-0 right-4 flex flex-col gap-3 z-[260]">
                {visibleControls.map((c) => (
                    <button
                        key={c.key}
                        className={`bg-gray-800 text-white p-2 rounded-full shadow-md transition ${
                            c.key === "delete" ? "bg-red-600" : ""
                        }`}
                        onClick={() => {
                            if (!willOpenSheet(c.key)) {
                                c.onClick?.();
                                return;
                            }
                            setShowAlignFan(false);
                            setShowStyleFan(false);
                            setShowColorPopover(false);
                            setActiveKey((prev) => (prev === c.key ? null : c.key));
                        }}
                        aria-label={c.label}
                        title={c.label}
                    >
                        <c.icon size={22} />
                    </button>
                ))}
            </div>

            {/* STYLE-Fächer (B/I/U) – vertikal zentriert */}
            <AnimatePresence>
                {showStyleFan && active?.type === "text" && (
                    <motion.div
                        className="absolute right-[64px] z-[261]"
                        style={{ top: `${Math.max(0, styleTop)}px` }}
                        {...popoverAnim}
                    >
                        {/* Pfeil */}
                        <span
                            className="absolute right-[-6px] top-1/2 -translate-y-1/2"
                            style={{
                                width: 0,
                                height: 0,
                                borderTop: "6px solid transparent",
                                borderBottom: "6px solid transparent",
                                borderLeft: "6px solid white",
                                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
                            }}
                        />
                        <div className="flex flex-col gap-2 bg-white border border-gray-200 rounded-xl shadow p-2">
                            <button
                                className={`bg-white text-gray-800 p-2 rounded-full shadow border ${
                                    isBold ? "border-gray-400" : "border-gray-200"
                                } hover:bg-gray-50`}
                                onClick={() => patchText({ fontStyle: nextFontStyle(activeText?.fontStyle, "bold") })}
                                aria-label="Fett"
                                title="Fett"
                            >
                                <FiBold size={20} />
                            </button>
                            <button
                                className={`bg-white text-gray-800 p-2 rounded-full shadow border ${
                                    isItalic ? "border-gray-400" : "border-gray-200"
                                } hover:bg-gray-50 italic`}
                                onClick={() => patchText({ fontStyle: nextFontStyle(activeText?.fontStyle, "italic") })}
                                aria-label="Kursiv"
                                title="Kursiv"
                            >
                                <FiItalic size={20} />
                            </button>
                            <button
                                className={`bg-white text-gray-800 p-2 rounded-full shadow border ${
                                    isUnder ? "border-gray-400" : "border-gray-200"
                                } hover:bg-gray-50`}
                                onClick={toggleUnderline}
                                aria-label="Unterstreichen"
                                title="Unterstreichen"
                            >
                                <LuUnderline size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Alignment-Fächer – vertikal zentriert */}
            <AnimatePresence>
                {showAlignFan && active?.type === "text" && (
                    <motion.div
                        className="absolute right-[64px] z-[261]"
                        style={{ top: `${Math.max(0, fanTop)}px` }}
                        {...popoverAnim}
                    >
                        <span
                            className="absolute right-[-6px] top-1/2 -translate-y-1/2"
                            style={{
                                width: 0,
                                height: 0,
                                borderTop: "6px solid transparent",
                                borderBottom: "6px solid transparent",
                                borderLeft: "6px solid white",
                                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
                            }}
                        />
                        <div className="flex flex-col gap-2 bg-white border border-gray-200 rounded-xl shadow p-2">
                            {["left", "center", "right"].map((a) => {
                                const Icon = a === "left" ? FiAlignLeft : a === "center" ? FiAlignCenter : FiAlignRight;
                                return (
                                    <button
                                        key={a}
                                        className="bg-white text-gray-800 p-2 rounded-full shadow border border-gray-200 hover:bg-gray-50"
                                        onClick={() => {
                                            patchText({ align: a });
                                            setShowAlignFan(false);
                                        }}
                                        aria-label={a}
                                    >
                                        <Icon size={20} />
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Farb-Popover – vertikal zentriert */}
            <AnimatePresence>
                {showColorPopover && active?.type === "text" && (
                    <motion.div
                        className="absolute right-[64px] z-[261]"
                        style={{ top: `${Math.max(0, colorTop)}px` }}
                        {...popoverAnim}
                    >
                        <span
                            className="absolute right-[-6px] top-1/2 -translate-y-1/2"
                            style={{
                                width: 0,
                                height: 0,
                                borderTop: "6px solid transparent",
                                borderBottom: "6px solid transparent",
                                borderLeft: "6px solid white",
                                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
                            }}
                        />
                        <div className="bg-white border border-gray-200 rounded-xl shadow p-2 flex items-center">
                            <input
                                type="color"
                                className="h-9 w-12 rounded-md cursor-pointer"
                                value={colorValue}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setColorValue(val);
                                    patchText({ fill: val }); // sofort übernehmen
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Sheet (nur Slider + FontFamily) */}
            <AnimatePresence>
                {activeControl && (
                    <motion.div
                        key="slider"
                        className="fixed left-0 right-0 bottom-0 bg-white p-4 rounded-t-2xl shadow-2xl z-[270]"
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-base font-semibold">{activeControl.label}</h3>
                            {active && (
                                <button
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 text-white text-sm"
                                    onClick={() => {
                                        onDeleteActive?.();
                                        setActiveKey(null);
                                        setShowAlignFan(false);
                                        setShowStyleFan(false);
                                        setShowColorPopover(false);
                                    }}
                                >
                                    <FiTrash2 /> Löschen
                                </button>
                            )}
                        </div>

                        {activeControl.key === "fontFamily" ? (
                            <div className="grid grid-cols-2 gap-3">
                                {AVAILABLE_FONTS.map((f) => (
                                    <button
                                        key={f}
                                        className="text-left py-2 px-3 rounded-md border hover:bg-[#f7f2f4]"
                                        style={{ fontFamily: f }}
                                        onClick={() => {
                                            patchText({ fontFamily: f });
                                            setActiveKey(null);
                                        }}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <Slider
                                value={activeControl.value}
                                min={activeControl.min}
                                max={activeControl.max}
                                step={activeControl.key === "rotation" ? 1 : activeControl.key === "fontSize" ? 1 : 0.1}
                                onChange={activeControl.onChange}
                                sx={sliderSX}
                            />
                        )}

                        <button
                            className="mt-3 w-full py-2 bg-[#393836] text-white rounded-md text-sm"
                            onClick={() => setActiveKey(null)}
                        >
                            Schließen
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
