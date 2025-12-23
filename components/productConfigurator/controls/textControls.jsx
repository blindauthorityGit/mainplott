import React from "react";
import { Slider } from "@mui/material";
import {
    FiGitCommit,
    FiRotateCcw,
    FiMaximize,
    FiAlignLeft,
    FiAlignCenter,
    FiAlignRight,
    FiAlignJustify,
} from "react-icons/fi";
import { P } from "@/components/typography";

export default function TextControls({
    textObj,
    setTextProp,
    xMin,
    xMax,
    yMin,
    yMax,
    sizeMin = 10,
    sizeMax = 200,
    defaultFontSize = 36,
    fontOptions = ["Roboto", "Arial", "Impact", "Comic Sans MS", "Montserrat", "Courier New"],
}) {
    if (!textObj) return null;

    // Non-linear, center-anchored mapping
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    const MIN = sizeMin;
    const MAX = sizeMax;
    const BASE = clamp(defaultFontSize, MIN, MAX);

    // Exponents control sensitivity:
    // - alphaDown < 1  => finer near BASE when going smaller
    // - alphaUp   < 1  => coarser near BASE when going bigger
    const alphaDown = 0.55; // feel free to tweak (0.45..0.7)
    const alphaUp = 0.65; // feel free to tweak (0.55..0.8)

    // font-size -> slider position [0..100]
    const sizeToPos = (sizeIn) => {
        const s = clamp(Number.isFinite(sizeIn) ? sizeIn : BASE, MIN, MAX);
        if (s <= BASE) {
            const r = (s - MIN) / (BASE - MIN || 1);
            const u = Math.pow(r, 1 / alphaDown); // inverse mapping
            return u * 50;
        } else {
            const r = (s - BASE) / (MAX - BASE || 1);
            const u = Math.pow(r, 1 / alphaUp); // inverse mapping
            return 50 + u * 50;
        }
    };

    // slider position [0..100] -> font-size
    const posToSize = (pos) => {
        const t = clamp(Number(pos), 0, 100) / 100;
        if (t <= 0.5) {
            const u = t / 0.5;
            const r = Math.pow(u, alphaDown);
            return MIN + (BASE - MIN) * r;
        } else {
            const u = (t - 0.5) / 0.5;
            const r = Math.pow(u, alphaUp);
            return BASE + (MAX - BASE) * r;
        }
    };

    // keep slider centered by default
    const currentFontSize = Number.isFinite(textObj.fontSize) ? textObj.fontSize : BASE;
    const sizeSliderValue = sizeToPos(currentFontSize);

    // Subtle, compact slider styling
    const subtleSliderSX = {
        "& .MuiSlider-thumb": {
            backgroundColor: "#393836",
            width: 14,
            height: 14,
            border: "2px solid white",
            boxShadow: "none",
        },
        "& .MuiSlider-track": { backgroundColor: "#e6d1d5", height: 4, border: "none" },
        "& .MuiSlider-rail": { backgroundColor: "#EBE0E1", height: 4, opacity: 1 },
        "& .MuiSlider-markLabel": { fontSize: 10 },
    };

    const centerX = Math.round((xMin + xMax) / 2);
    const centerY = Math.round((yMin + yMax) / 2);

    const isBold = /bold/.test(textObj.fontStyle || "");
    const isItalic = /italic/.test(textObj.fontStyle || "");
    const hasUnderline = /\bunderline\b/.test(textObj.textDecoration || "");

    const toggleBold = () => {
        const fs = textObj.fontStyle || "normal";
        const next = isBold ? fs.replace(/bold ?/, "") : `bold ${fs}`;
        setTextProp({ fontStyle: next.trim() || "normal" });
    };

    const toggleItalic = () => {
        const fs = textObj.fontStyle || "normal";
        const next = isItalic ? fs.replace(/italic ?/, "") : `${fs} italic`;
        setTextProp({ fontStyle: next.trim() || "normal" });
    };

    const toggleUnderline = () => {
        const td = textObj.textDecoration || "";
        const next = hasUnderline ? td.replace(/\bunderline\b/, "").trim() : `${td} underline`.trim();
        setTextProp({ textDecoration: next });
    };

    const handleFontSizeChange = (_e, v) => setTextProp({ fontSize: Number(v) });
    const handleFontSizeCommit = (_e, v) => {
        // If user increased size and the node was scaled down, normalize scale
        const current = Number.isFinite(textObj.fontSize) ? textObj.fontSize : defaultFontSize;
        const wasScaledDown = (textObj.scale ?? 1) < 1;
        if (Number(v) > current && wasScaledDown) {
            setTextProp({ scale: 1 });
        }
    };

    const chipBase = "h-8 px-2 rounded-md border text-xs font-medium hover:bg-gray-50 transition focus:outline-none";
    const chipActive = "bg-[#f4eaec] border-primaryColor-400 text-primaryColor-700";
    const chipIdle = "border-gray-200 text-gray-700";

    return (
        <div className="hidden lg:block">
            {/* TEXTAREA */}
            <div className="mb-3">
                <P klasse="!text-xs 2xl:!text-sm !mb-1">Text</P>
                <textarea
                    value={textObj.value || ""}
                    onChange={(e) => setTextProp({ value: e.target.value })}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 resize-y"
                    placeholder="Mehrzeiligen Text hier eingeben…"
                />
            </div>

            {/* COMPACT TOOLBAR: B I U + ALIGNMENT in one row */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
                {/* Style chips */}
                <button
                    type="button"
                    className={`${chipBase} ${isBold ? chipActive : chipIdle}`}
                    onClick={toggleBold}
                    title="Fett"
                >
                    <span className="font-bold">B</span>
                </button>
                <button
                    type="button"
                    className={`${chipBase} italic ${isItalic ? chipActive : chipIdle}`}
                    onClick={toggleItalic}
                    title="Kursiv"
                >
                    I
                </button>
                <button
                    type="button"
                    className={`${chipBase} underline ${hasUnderline ? chipActive : chipIdle}`}
                    onClick={toggleUnderline}
                    title="Unterstreichen"
                >
                    U
                </button>

                {/* Divider */}
                <span className="mx-1 h-5 w-px bg-gray-200" />

                {/* Alignment chips */}
                {[
                    { k: "left", Icon: FiAlignLeft, label: "Links" },
                    { k: "center", Icon: FiAlignCenter, label: "Zentriert" },
                    { k: "right", Icon: FiAlignRight, label: "Rechts" },
                    { k: "justify", Icon: FiAlignJustify, label: "Blocksatz" },
                ].map(({ k, Icon, label }) => (
                    <button
                        key={k}
                        type="button"
                        className={`${chipBase} ${textObj.align === k ? chipActive : chipIdle}`}
                        onClick={() => setTextProp({ align: k })}
                        title={label}
                        aria-pressed={textObj.align === k}
                    >
                        <Icon className="text-[14px]" />
                    </button>
                ))}
            </div>

            {/* TIGHT LINE-HEIGHT + KERNING ROW */}
            <div className="mb-3 grid grid-cols-2 gap-3">
                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-600">Zeilenhöhe</span>
                        <span className="text-[11px] text-gray-500">
                            {(Number.isFinite(textObj.lineHeight) ? textObj.lineHeight : 1.2).toFixed(2)}
                        </span>
                    </div>
                    <Slider
                        size="small"
                        value={Number.isFinite(textObj.lineHeight) ? textObj.lineHeight : 1.2}
                        min={0.9}
                        max={2.0}
                        step={0.05}
                        onChange={(_e, v) => setTextProp({ lineHeight: Number(v) })}
                        sx={subtleSliderSX}
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-600">Abstand (Buchstaben)</span>
                        <span className="text-[11px] text-gray-500">
                            {(Number.isFinite(textObj.letterSpacing) ? textObj.letterSpacing : 0).toFixed(2)}
                        </span>
                    </div>
                    <Slider
                        size="small"
                        value={Number.isFinite(textObj.letterSpacing) ? textObj.letterSpacing : 0}
                        min={0}
                        max={2}
                        step={0.05}
                        onChange={(_e, v) => setTextProp({ letterSpacing: Number(v) })}
                        sx={subtleSliderSX}
                    />
                </div>
            </div>

            {/* FONT + COLOR (compact) */}
            <div className="grid grid-cols-2 gap-3 items-end mb-3">
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
                        className="w-full h-9 p-0 border rounded-md max-w-12"
                    />
                </div>
            </div>

            {/* X POSITION (compact) */}
            <div className="mb-3">
                <P klasse="!text-xs 2xl:!text-sm !mb-1">X-Achse Position</P>
                <div className="flex items-center gap-3">
                    <Slider
                        size="small"
                        value={Math.round(textObj.x || 0)}
                        min={xMin}
                        max={xMax}
                        step={1}
                        onChange={(_e, v) => setTextProp({ x: Number(v) })}
                        aria-labelledby="text-x-slider"
                        sx={subtleSliderSX}
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

            {/* Y POSITION (compact) */}
            <div className="mb-3">
                <P klasse="!text-xs 2xl:!text-sm !mb-1">Y-Achse Position</P>
                <div className="flex items-center gap-3">
                    <Slider
                        size="small"
                        value={Math.round(textObj.y || 0)}
                        min={yMin}
                        max={yMax}
                        step={1}
                        onChange={(_e, v) => setTextProp({ y: Number(v) })}
                        aria-labelledby="text-y-slider"
                        sx={subtleSliderSX}
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

            {/* CURVE (compact) */}
            <div className="mb-3">
                <P klasse="!text-xs 2xl:!text-sm !mb-1">Biegung</P>
                <div className="flex items-center gap-3">
                    <Slider
                        size="small"
                        value={Number.isFinite(textObj.curvature) ? textObj.curvature : 0}
                        min={-100}
                        max={100}
                        step={1}
                        onChange={(_e, v) => setTextProp({ curvature: Number(v) })}
                        aria-label="text-curve-slider"
                        sx={subtleSliderSX}
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

            {/* SIZE (compact) */}
            {/* SIZE (non-linear, center-anchored) */}
            <div className="mb-3">
                <P klasse="!text-xs 2xl:!text-sm !mb-1">Größe</P>
                <div className="flex items-center gap-3">
                    <Slider
                        size="small"
                        value={sizeSliderValue} // <-- position [0..100], not font-size
                        min={0}
                        max={100}
                        step={1}
                        onChange={(_e, v) => {
                            const newSize = Math.round(posToSize(v));
                            setTextProp({ fontSize: newSize });
                        }}
                        onChangeCommitted={(_e, v) => {
                            const newSize = posToSize(v);
                            // optional: normalize scale if user grows text that was scaled down
                            const prev = currentFontSize;
                            if (newSize > prev && (textObj.scale ?? 1) < 1) {
                                setTextProp({ scale: 1 });
                            }
                        }}
                        aria-labelledby="text-size-slider"
                        sx={subtleSliderSX}
                    />
                    <button
                        className="bg-textColor text-white p-2 rounded-[10px]"
                        onClick={() => setTextProp({ fontSize: BASE, scale: 1 })}
                        title="Größe zurücksetzen"
                    >
                        <FiMaximize />
                    </button>
                </div>
                {/* tiny live label (optional) */}
                <div className="mt-1 text-[11px] text-gray-500">Aktuell: {Math.round(currentFontSize)} px</div>
            </div>
        </div>
    );
}
