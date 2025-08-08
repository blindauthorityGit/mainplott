// components/productConfigurator/controls/GraphicControls.jsx
import React from "react";
import { Slider } from "@mui/material";
import { FiGitCommit, FiRotateCcw, FiMaximize } from "react-icons/fi";
import { P } from "@/components/typography";

export default function GraphicControls({
    activeGraphic,
    minX,
    maxX,
    minY,
    maxY,
    allowedMaxScale,
    onX,
    onY,
    onRotation,
    onScale,
    onCenterX,
    onCenterY,
    onResetRotation,
    onResetScale,
}) {
    if (!activeGraphic) return null;

    return (
        <div className="hidden lg:block">
            {/* X */}
            <div className="mb-4 lg:mb-2 2xl:mb-4">
                <P klasse="!text-xs 2xl:!text-sm !mb-0">X-Achse Position</P>
                <div className="flex space-x-4">
                    <Slider
                        value={activeGraphic?.xPosition ?? minX}
                        min={minX}
                        max={maxX}
                        onChange={onX}
                        aria-labelledby="x-axis-slider"
                        sx={{
                            "& .MuiSlider-thumb": {
                                backgroundColor: "#393836",
                                width: 20,
                                height: 20,
                                border: "2px solid white",
                            },
                            "& .MuiSlider-track": { backgroundColor: "#e6d1d5", height: 6, border: "none" },
                            "& .MuiSlider-rail": { backgroundColor: "#EBE0E1", height: 6 },
                        }}
                    />
                    <button className=" bg-textColor text-white p-2 rounded-[10px]" onClick={onCenterX}>
                        <FiGitCommit />
                    </button>
                </div>
            </div>

            {/* Y */}
            <div className="mb-4 lg:mb-2 2xl:mb-4">
                <P klasse="!text-xs 2xl:!text-sm !mb-0">Y-Achse Position</P>
                <div className="flex space-x-4">
                    <Slider
                        value={activeGraphic?.yPosition ?? minY}
                        min={minY}
                        max={maxY}
                        onChange={onY}
                        aria-labelledby="y-axis-slider"
                        sx={{
                            "& .MuiSlider-thumb": {
                                backgroundColor: "#393836",
                                width: 20,
                                height: 20,
                                border: "2px solid white",
                            },
                            "& .MuiSlider-track": { backgroundColor: "#e6d1d5", height: 6, border: "none" },
                            "& .MuiSlider-rail": { backgroundColor: "#EBE0E1", height: 6 },
                        }}
                    />
                    <button className="rotate-90 bg-textColor text-white p-2 rounded-[10px]" onClick={onCenterY}>
                        <FiGitCommit />
                    </button>
                </div>
            </div>

            {/* Rotation */}
            <div className="mb-4 lg:mb-2 2xl:mb-4">
                <P klasse="!text-xs 2xl:!text-sm !mb-0">Rotation</P>
                <div className="flex space-x-4">
                    <Slider
                        value={activeGraphic?.rotation ?? 0}
                        min={-180}
                        max={180}
                        step={1}
                        onChange={onRotation}
                        aria-labelledby="rotation-slider"
                        sx={{
                            "& .MuiSlider-thumb": {
                                backgroundColor: "#393836",
                                width: 20,
                                height: 20,
                                border: "2px solid white",
                            },
                            "& .MuiSlider-track": { backgroundColor: "#e6d1d5", height: 6, border: "none" },
                            "& .MuiSlider-rail": { backgroundColor: "#EBE0E1", height: 6 },
                        }}
                    />
                    <button className="bg-textColor text-white p-2 rounded-[10px]" onClick={onResetRotation}>
                        <FiRotateCcw />
                    </button>
                </div>
            </div>

            {/* Größe */}
            <div className="mb-4 lg:mb-2 2xl:mb-4">
                <P klasse="!text-xs 2xl:!text-sm !mb-0">Größe</P>
                <div className="flex space-x-4">
                    <Slider
                        value={activeGraphic?.scale ?? 1}
                        min={0.3}
                        max={allowedMaxScale}
                        step={0.01}
                        onChange={onScale}
                        aria-labelledby="scale-slider"
                        sx={{
                            "& .MuiSlider-thumb": {
                                backgroundColor: "#393836",
                                width: 20,
                                height: 20,
                                border: "2px solid white",
                            },
                            "& .MuiSlider-track": { backgroundColor: "#e6d1d5", height: 6, border: "none" },
                            "& .MuiSlider-rail": { backgroundColor: "#EBE0E1", height: 6 },
                        }}
                    />
                    <button className=" bg-textColor text-white p-2 rounded-[10px]" onClick={onResetScale}>
                        <FiMaximize />
                    </button>
                </div>
            </div>
        </div>
    );
}
