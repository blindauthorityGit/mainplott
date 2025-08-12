import React from "react";
import { Slider } from "@mui/material";
import { FiGitCommit, FiRotateCcw, FiMaximize } from "react-icons/fi";
import { P } from "@/components/typography";

export default function TextControls({
    textObj,
    setTextProp,
    xMin,
    xMax,
    yMin,
    yMax,
    sizeMin = 10,
    sizeMax = 100,
    defaultFontSize = 36, // <- anpassbar
    fontOptions = ["Roboto", "Arial", "Impact", "Comic Sans MS", "Montserrat", "Courier New"],
}) {
    if (!textObj) return null;

    const sliderSX = {
        "& .MuiSlider-thumb": {
            backgroundColor: "#393836",
            width: 20,
            height: 20,
            border: "2px solid white",
        },
        "& .MuiSlider-track": { backgroundColor: "#e6d1d5", height: 6, border: "none" },
        "& .MuiSlider-rail": { backgroundColor: "#EBE0E1", height: 6 },
    };

    const centerX = Math.round((xMin + xMax) / 2);
    const centerY = Math.round((yMin + yMax) / 2);

    return (
        <div className="hidden lg:block">
            {/* Text */}
            <div className="mb-4 lg:mb-2 2xl:mb-4">
                <P klasse="!text-xs 2xl:!text-sm !mb-0">Text</P>
                <input
                    type="text"
                    value={textObj.value}
                    onChange={(e) => setTextProp({ value: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                />
            </div>

            {/* Schriftart + Farbe */}
            <div className="grid grid-cols-2 gap-4 items-end mb-4 lg:mb-2 2xl:mb-4">
                <div>
                    <P klasse="!text-xs 2xl:!text-sm !mb-0">Schriftart</P>
                    <select
                        value={textObj.fontFamily}
                        onChange={(e) => setTextProp({ fontFamily: e.target.value })}
                        className="w-full border rounded-md px-3 py-2"
                        style={{ fontFamily: textObj.fontFamily }}
                    >
                        {fontOptions.map((f) => (
                            <option key={f} value={f} style={{ fontFamily: f }}>
                                {f}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <P klasse="!text-xs 2xl:!text-sm !mb-0">Farbe</P>
                    <input
                        type="color"
                        value={textObj.fill || "#000000"}
                        onChange={(e) => setTextProp({ fill: e.target.value })}
                        className="w-full h-10 p-0 border rounded-md max-w-12"
                    />
                </div>
            </div>

            {/* Größe */}
            <div className="mb-4 lg:mb-2 2xl:mb-4">
                <P klasse="!text-xs 2xl:!text-sm !mb-0">Größe</P>
                <div className="flex space-x-4">
                    <Slider
                        value={Number.isFinite(textObj.fontSize) ? textObj.fontSize : defaultFontSize}
                        min={sizeMin}
                        max={sizeMax}
                        step={1}
                        onChange={(_e, v) => setTextProp({ fontSize: Number(v) })}
                        aria-labelledby="text-size-slider"
                        sx={sliderSX}
                    />
                    <button
                        className="bg-textColor text-white p-2 rounded-[10px]"
                        onClick={() => setTextProp({ fontSize: defaultFontSize })}
                        title="Größe zurücksetzen"
                    >
                        <FiMaximize />
                    </button>
                </div>
            </div>

            {/* Biegung */}
            <div className="mb-4 lg:mb-2 2xl:mb-4">
                <P klasse="!text-xs 2xl:!text-sm !mb-0">Biegung</P>
                <div className="flex space-x-4">
                    <Slider
                        value={Number.isFinite(textObj.curvature) ? textObj.curvature : 0}
                        min={-100}
                        max={100}
                        step={1}
                        onChange={(_e, v) => setTextProp({ curvature: Number(v) })}
                        aria-label="text-curve-slider"
                        sx={sliderSX}
                    />
                    <button
                        className="bg-textColor text-white p-2 rounded-[10px]"
                        onClick={() => setTextProp({ curvature: 0 })}
                        title="Biegung zurücksetzen"
                    >
                        <FiRotateCcw />
                    </button>
                </div>
            </div>

            {/* X */}
            <div className="mb-4 lg:mb-2 2xl:mb-4">
                <P klasse="!text-xs 2xl:!text-sm !mb-0">X‑Achse Position</P>
                <div className="flex space-x-4">
                    <Slider
                        value={Math.round(textObj.x || 0)}
                        min={xMin}
                        max={xMax}
                        step={1}
                        onChange={(_e, v) => setTextProp({ x: Number(v) })}
                        aria-labelledby="text-x-slider"
                        sx={sliderSX}
                    />
                    <button
                        className="bg-textColor text-white p-2 rounded-[10px]"
                        onClick={() => setTextProp({ x: centerX })}
                        title="Horizontal zentrieren"
                    >
                        <FiGitCommit />
                    </button>
                </div>
            </div>

            {/* Y */}
            <div className="mb-4 lg:mb-2 2xl:mb-4">
                <P klasse="!text-xs 2xl:!text-sm !mb-0">Y‑Achse Position</P>
                <div className="flex space-x-4">
                    <Slider
                        value={Math.round(textObj.y || 0)}
                        min={yMin}
                        max={yMax}
                        step={1}
                        onChange={(_e, v) => setTextProp({ y: Number(v) })}
                        aria-labelledby="text-y-slider"
                        sx={sliderSX}
                    />
                    <button
                        className="rotate-90 bg-textColor text-white p-2 rounded-[10px]"
                        onClick={() => setTextProp({ y: centerY })}
                        title="Vertikal zentrieren"
                    >
                        <FiGitCommit />
                    </button>
                </div>
            </div>
        </div>
    );
}
