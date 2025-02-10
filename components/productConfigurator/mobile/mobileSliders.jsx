import React, { useState, useEffect } from "react";
import { Slider } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiZoomIn,
    FiMinimize, // scale
    FiArrowUp, // Y-axis
    FiGitCommit, // X-axis
    FiMaximize, // Reset
} from "react-icons/fi";

import useStore from "@/store/store"; // import your Zustand store

export default function MobileSliders({ containerWidth, containerHeight, zoomLevel, setZoomLevel }) {
    const { purchaseData, setPurchaseData, isMobileSliderOpen, openMobileSlider, closeMobileSlider } = useStore();

    // Local state: track which slider is open
    // e.g. "zoom", "scale", "x", "y", or null if none
    const [activeSlider, setActiveSlider] = useState(null);

    // Whenever activeSlider changes, if it's not null => openMobileSlider
    // if it's null => closeMobileSlider
    useEffect(() => {
        if (activeSlider) {
            openMobileSlider();
        } else {
            closeMobileSlider();
        }
    }, [activeSlider, openMobileSlider, closeMobileSlider]);

    // Handlers
    const handleXChange = (e, val) => {
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [prev.currentSide]: {
                    ...prev.sides[prev.currentSide],
                    xPosition: val,
                },
            },
        }));
    };

    const handleYChange = (e, val) => {
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [prev.currentSide]: {
                    ...prev.sides[prev.currentSide],
                    yPosition: val,
                },
            },
        }));
    };

    const handleScaleChange = (e, val) => {
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [prev.currentSide]: {
                    ...prev.sides[prev.currentSide],
                    scale: val,
                },
            },
        }));
    };

    const handleZoomChange = (e, val) => {
        setZoomLevel(val);
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [prev.currentSide]: {
                    ...prev.sides[prev.currentSide],
                    xPosition: containerWidth / 2,
                    yPosition: containerHeight / 2,
                    scale: 1,
                },
            },
        }));
    };

    // MUI slider custom styling
    const sliderStyles = {
        "& .MuiSlider-track": {
            bgcolor: "#ba979d", // your brand color
        },
        "& .MuiSlider-thumb": {
            bgcolor: "#393836", // or another brand color
            border: "2px solid white",
        },
        "& .MuiSlider-rail": {
            bgcolor: "#E0E0E0",
        },
    };

    // The controls array
    const controls = [
        {
            key: "zoom",
            icon: FiZoomIn,
            label: "Zoom",
            onChange: handleZoomChange,
            value: zoomLevel,
            min: 1,
            max: 3,
        },
        {
            key: "scale",
            icon: FiMinimize,
            label: "Größe",
            onChange: handleScaleChange,
            value: purchaseData.sides[purchaseData.currentSide]?.scale || 1,
            min: 0.3,
            max: 3.5,
        },
        {
            key: "x",
            icon: FiGitCommit,
            label: "X-Achse",
            onChange: handleXChange,
            value: purchaseData.sides[purchaseData.currentSide]?.xPosition ?? containerWidth / 2,
            min: 0,
            max: containerWidth,
        },
        {
            key: "y",
            icon: FiArrowUp,
            label: "Y-Achse",
            onChange: handleYChange,
            value: purchaseData.sides[purchaseData.currentSide]?.yPosition ?? containerHeight / 2,
            min: 0,
            max: containerHeight,
        },
        {
            key: "reset",
            icon: FiMaximize,
            label: "Reset Zoom",
            onClick: handleResetZoom,
        },
    ];

    const activeControl =
        activeSlider && activeSlider !== "reset" ? controls.find((c) => c.key === activeSlider) : null;

    return (
        <>
            {/* Floating Buttons */}
            <div className="absolute top-0 right-4 flex flex-col gap-3 z-50 lg:hidden">
                {controls.map((control) => (
                    <button
                        key={control.key}
                        className={`bg-gray-800 text-white p-2 rounded-full shadow-md hover:shadow-lg transition ${
                            activeSlider === control.key ? "ring-4 ring-[#ba979d]" : ""
                        }`}
                        onClick={() => {
                            // If reset => call onClick, setActiveSlider(null)
                            if (control.key === "reset") {
                                control.onClick?.();
                                setActiveSlider(null);
                                return;
                            }

                            // Toggle logic for other sliders
                            setActiveSlider((prev) => (prev === control.key ? null : control.key));
                        }}
                    >
                        <control.icon size={22} />
                    </button>
                ))}
            </div>

            {/* The slider panel if active */}
            <AnimatePresence>
                {activeControl && (
                    <motion.div
                        key="slider-panel"
                        className="fixed -bottom-0 left-0 right-0 bg-white p-4 rounded-t-2xl shadow-2xl z-[999]"
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <h3 className="text-base font-semibold text-center mb-2">{activeControl.label}</h3>

                        <Slider
                            value={activeControl.value}
                            min={activeControl.min}
                            max={activeControl.max}
                            step={0.1}
                            onChange={activeControl.onChange}
                            aria-labelledby={`${activeControl.key}-slider`}
                            sx={sliderStyles}
                        />

                        <button
                            className="mt-3 w-full py-2 bg-textColor font-body text-white rounded-md text-sm font-medium"
                            onClick={() => setActiveSlider(null)}
                        >
                            Schließen
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
