import React from "react";
import { Slider } from "@mui/material";
import { P } from "@/components/typography";

export default function TextControls({
    textObj, // aktives Text-Objekt
    setTextProp, // (patch) => void
    xMin,
    xMax, // Slider-Ranges X
    yMin,
    yMax, // Slider-Ranges Y
    sizeMin = 10, // sinnvolles Default-Min
    sizeMax = 200, // wird von außen sauber gesetzt
    fontOptions = ["Roboto", "Arial", "Impact", "Comic Sans MS", "Montserrat", "Courier New"],
}) {
    if (!textObj) return null;

    const sliderSX = {
        "& .MuiSlider-thumb": {
            backgroundColor: "#393836",
            width: 20,
            height: 20,
            border: "2px solid white",
            "&:hover, &.Mui-focusVisible": { boxShadow: "0 0 0 8px rgba(79,70,229,.16)" },
        },
        "& .MuiSlider-track": { backgroundColor: "#e6d1d5", height: 6, border: "none" },
        "& .MuiSlider-rail": { backgroundColor: "#EBE0E1", height: 6 },
    };

    return (
        <div className="space-y-4">
            {/* Textinhalt */}
            <div>
                <P klasse="!text-xs 2xl:!text-sm !mb-1">Text</P>
                <input
                    type="text"
                    value={textObj.value}
                    onChange={(e) => setTextProp({ value: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                />
            </div>

            {/* Schriftart + Farbe nebeneinander (je 1/2) */}
            <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                    <P klasse="!text-xs 2xl:!text-sm !mb-1">Schriftart</P>
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
                    <P klasse="!text-xs 2xl:!text-sm !mb-1">Farbe</P>
                    <input
                        type="color"
                        value={textObj.fill || "#000000"}
                        onChange={(e) => setTextProp({ fill: e.target.value })}
                        className="w-full h-10 p-0 border rounded-md max-w-12"
                    />
                </div>
            </div>

            {/* Größe – voller Slider */}
            <div>
                <P klasse="!text-xs 2xl:!text-sm !mb-1">Größe</P>
                <Slider
                    value={Number.isFinite(textObj.fontSize) ? textObj.fontSize : 36}
                    min={sizeMin}
                    max={sizeMax}
                    step={1}
                    onChange={(_e, v) => setTextProp({ fontSize: Number(v) })}
                    aria-labelledby="text-size-slider"
                    sx={sliderSX}
                />
            </div>

            {/* X – voller Slider */}
            <div>
                <P klasse="!text-xs 2xl:!text-sm !mb-1">X</P>
                <Slider
                    value={Math.round(textObj.x || 0)}
                    min={xMin}
                    max={xMax}
                    step={1}
                    onChange={(_e, v) => setTextProp({ x: Number(v) })}
                    aria-labelledby="text-x-slider"
                    sx={sliderSX}
                />
            </div>

            {/* Y – voller Slider */}
            <div>
                <P klasse="!text-xs 2xl:!text-sm !mb-1">Y</P>
                <Slider
                    value={Math.round(textObj.y || 0)}
                    min={yMin}
                    max={yMax}
                    step={1}
                    onChange={(_e, v) => setTextProp({ y: Number(v) })}
                    aria-labelledby="text-y-slider"
                    sx={sliderSX}
                />
            </div>
        </div>
    );
}
