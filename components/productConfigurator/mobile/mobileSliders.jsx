import React, { useState } from "react";
import { Slider } from "@mui/material";
import useStore from "@/store/store";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiZoomIn,
    FiMinimize, // For scaling
    FiArrowUp, // For Y-axis (vertical)
    FiGitCommit, // For X-axis (horizontal)
    FiMaximize, // Reset
} from "react-icons/fi";

export default function MobileSliders({ containerWidth, containerHeight, zoomLevel, setZoomLevel }) {
    const { purchaseData, setPurchaseData } = useStore();
    const [activeSlider, setActiveSlider] = useState(null); // Track the active slider

    // Handlers for each slider
    const handleXChange = (event, newValue) => {
        setPurchaseData({
            ...purchaseData,
            sides: {
                ...purchaseData.sides,
                [purchaseData.currentSide]: {
                    ...purchaseData.sides[purchaseData.currentSide],
                    xPosition: newValue,
                },
            },
        });
    };

    const handleYChange = (event, newValue) => {
        setPurchaseData({
            ...purchaseData,
            sides: {
                ...purchaseData.sides,
                [purchaseData.currentSide]: {
                    ...purchaseData.sides[purchaseData.currentSide],
                    yPosition: newValue,
                },
            },
        });
    };

    const handleScaleChange = (event, newValue) => {
        setPurchaseData({
            ...purchaseData,
            sides: {
                ...purchaseData.sides,
                [purchaseData.currentSide]: {
                    ...purchaseData.sides[purchaseData.currentSide],
                    scale: newValue,
                },
            },
        });
    };

    const handleZoomChange = (event, newValue) => {
        setZoomLevel(newValue);
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
        setPurchaseData({
            ...purchaseData,
            sides: {
                ...purchaseData.sides,
                [purchaseData.currentSide]: {
                    ...purchaseData.sides[purchaseData.currentSide],
                    xPosition: containerWidth / 2,
                    yPosition: containerHeight / 2,
                    scale: 1, // Reset scale as well
                },
            },
        });
    };

    // Icons and handlers for the control buttons
    const controls = [
        { key: "zoom", icon: FiZoomIn, label: "Zoom", onChange: handleZoomChange, value: zoomLevel, min: 1, max: 3 },
        {
            key: "scale",
            icon: FiMinimize,
            label: "Größe",
            onChange: handleScaleChange,
            value: purchaseData.sides[purchaseData.currentSide].scale || 1,
            min: 0.3,
            max: 3.5,
        },
        {
            key: "x",
            icon: FiGitCommit,
            label: "X-Axis",
            onChange: handleXChange,
            value: purchaseData.sides[purchaseData.currentSide].xPosition || containerWidth / 2,
            min: 0,
            max: containerWidth,
        },
        {
            key: "y",
            icon: FiArrowUp,
            label: "Y-Axis",
            onChange: handleYChange,
            value: purchaseData.sides[purchaseData.currentSide].yPosition || containerHeight / 2,
            min: 0,
            max: containerHeight,
        },
        {
            key: "reset",
            icon: FiMaximize,
            label: "Reset Zoom",
            onClick: handleResetZoom, // Directly trigger reset
        },
    ];

    return (
        <div>
            {/* Floating Buttons for Sliders */}
            <div className="fixed top-4 right-4 flex flex-col gap-4 z-50 lg:hidden">
                {controls.map((control) => (
                    <button
                        key={control.key}
                        className={`bg-textColor text-white p-2 rounded-[20px] shadow-lg ${
                            activeSlider === control.key ? "ring-4 ring-primaryColor-light" : ""
                        }`}
                        onClick={
                            () =>
                                control.key === "reset"
                                    ? control.onClick() // Directly trigger reset for Reset button
                                    : setActiveSlider((prev) => (prev === control.key ? null : control.key)) // Toggle logic for sliders
                        }
                    >
                        <control.icon size={24} />
                    </button>
                ))}
            </div>

            {/* Slider Section */}
            <AnimatePresence>
                {activeSlider && activeSlider !== "reset" && (
                    <motion.div
                        className="fixed -bottom-28 font-body !z-[999] left-4 right-4 bg-white p-4 rounded-lg shadow-lg"
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <h3 className="text-lg font-semibold text-center">
                            {controls.find((c) => c.key === activeSlider).label}
                        </h3>
                        <Slider
                            value={controls.find((c) => c.key === activeSlider).value}
                            min={controls.find((c) => c.key === activeSlider).min}
                            max={controls.find((c) => c.key === activeSlider).max}
                            step={0.1}
                            onChange={controls.find((c) => c.key === activeSlider).onChange}
                            aria-labelledby={`${activeSlider}-slider`}
                        />
                        <button
                            variant="contained"
                            color="primary"
                            className="w-full "
                            onClick={() => setActiveSlider(null)} // Hide slider
                        >
                            schließen
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
