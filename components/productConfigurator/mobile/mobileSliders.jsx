import React, { useState, useEffect } from "react";
import { Slider } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { FiZoomIn, FiMinimize, FiArrowUp, FiGitCommit, FiRotateCcw, FiMaximize, FiTrash2 } from "react-icons/fi";
import useStore from "@/store/store";

export default function MobileSliders({ zoomLevel, setZoomLevel, onDeleteActive }) {
    const { purchaseData, setPurchaseData, openMobileSlider, closeMobileSlider } = useStore();

    const [activeKey, setActiveKey] = useState(null); // zoom | scale | x | y | rotation
    const currentSide = purchaseData.currentSide || "front";
    const side = purchaseData.sides?.[currentSide] || {};
    const { containerWidth = 0, containerHeight = 0, boundingRect } = purchaseData;

    const active = side.activeElement || null;
    const activeGraphicId = side.activeGraphicId;
    const activeGraphic = (side.uploadedGraphics || []).find((g) => g.id === activeGraphicId) || null;
    const activeText = active?.type === "text" ? (side.texts || []).find((t) => t.id === active.id) : null;

    // open/close bottom-sheet
    useEffect(() => {
        activeKey ? openMobileSlider() : closeMobileSlider();
    }, [activeKey, openMobileSlider, closeMobileSlider]);

    // helpers – write back
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

    // value getters
    const valScale = activeGraphic?.scale ?? activeText?.scale ?? 1;
    const valX = activeGraphic?.xPosition ?? activeText?.x ?? containerWidth / 2;
    const valY = activeGraphic?.yPosition ?? activeText?.y ?? containerHeight / 2;
    const valRot = activeGraphic?.rotation ?? activeText?.rotation ?? 0;

    // bounds from canvas
    const minX = 0,
        maxX = containerWidth;
    const minY = 0,
        maxY = containerHeight;

    // control definition
    const controls = [
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
            onChange: (_e, v) => (active?.type === "text" ? patchText({ scale: v }) : patchGraphic({ scale: v })),
        },
        {
            key: "x",
            icon: FiGitCommit,
            label: "X-Achse",
            min: minX,
            max: maxX,
            value: valX,
            onChange: (_e, v) => (active?.type === "text" ? patchText({ x: v }) : patchGraphic({ xPosition: v })),
        },
        {
            key: "y",
            icon: FiArrowUp,
            label: "Y-Achse",
            min: minY,
            max: maxY,
            value: valY,
            onChange: (_e, v) => (active?.type === "text" ? patchText({ y: v }) : patchGraphic({ yPosition: v })),
        },
        {
            key: "rotation",
            icon: FiRotateCcw,
            label: "Rotation",
            min: -180,
            max: 180,
            value: valRot,
            onChange: (_e, v) => (active?.type === "text" ? patchText({ rotation: v }) : patchGraphic({ rotation: v })),
        },
        {
            key: "reset",
            icon: FiMaximize,
            label: "Reset",
            onClick: () => {
                setZoomLevel(1);
                if (active?.type === "text") {
                    patchText({
                        x: boundingRect ? boundingRect.x + boundingRect.width / 2 : containerWidth / 2,
                        y: boundingRect ? boundingRect.y + boundingRect.height / 2 : containerHeight / 2,
                        scale: 1,
                        rotation: 0,
                    });
                } else if (activeGraphic) {
                    patchGraphic({
                        xPosition: boundingRect ? boundingRect.x + boundingRect.width / 2 : containerWidth / 2,
                        yPosition: boundingRect ? boundingRect.y + boundingRect.height / 2 : containerHeight / 2,
                        scale: 1,
                        rotation: 0,
                    });
                }
            },
        },
    ];

    const sliderSX = {
        "& .MuiSlider-track": { bgcolor: "#ba979d" },
        "& .MuiSlider-thumb": { bgcolor: "#393836", border: "2px solid white" },
        "& .MuiSlider-rail": { bgcolor: "#E0E0E0" },
    };

    const activeControl = activeKey && activeKey !== "reset" ? controls.find((c) => c.key === activeKey) : null;

    // Wenn kein aktives Element -> nur Zoom zeigen
    const showOnlyZoom = !active;

    return (
        <>
            {/* Floating Buttons rechts */}
            <div className="absolute top-0 right-4 flex flex-col gap-3 z-[260]">
                {(showOnlyZoom ? controls.filter((c) => c.key === "zoom") : controls).map((c) => (
                    <button
                        key={c.key}
                        className={`bg-gray-800 text-white p-2 rounded-full shadow-md transition ${
                            activeKey === c.key ? "ring-4 ring-[#ba979d]" : ""
                        }`}
                        onClick={() => {
                            if (c.key === "reset") {
                                c.onClick?.();
                                setActiveKey(null);
                                return;
                            }
                            setActiveKey((prev) => (prev === c.key ? null : c.key));
                        }}
                    >
                        <c.icon size={22} />
                    </button>
                ))}
            </div>

            {/* Bottom Sheet mit Slider + Löschen */}
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

                            {/* Löschen nur wenn Element aktiv (nicht bei reinem Zoom) */}
                            {active && (
                                <button
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 text-white text-sm"
                                    onClick={() => {
                                        onDeleteActive?.();
                                        setActiveKey(null);
                                    }}
                                >
                                    <FiTrash2 /> Löschen
                                </button>
                            )}
                        </div>

                        <Slider
                            value={activeControl.value}
                            min={activeControl.min}
                            max={activeControl.max}
                            step={activeControl.key === "rotation" ? 1 : 0.1}
                            onChange={activeControl.onChange}
                            sx={sliderSX}
                        />

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
