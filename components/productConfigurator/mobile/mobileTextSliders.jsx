import React, { useMemo } from "react";
import { Slider } from "@mui/material";
import { FiTrash2 } from "react-icons/fi";
import useStore from "@/store/store";

export default function MobileTextSliders({ boundingRect, onDeleteActive }) {
    const { purchaseData, setPurchaseData } = useStore();
    const currentSide = purchaseData.currentSide || "front";
    const side = purchaseData.sides?.[currentSide] || {};
    const active = side.activeElement || null;
    const text = useMemo(() => {
        if (active?.type !== "text") return null;
        return (side.texts || []).find((t) => t.id === active.id) || null;
    }, [active, side.texts]);

    if (!text) return null;

    const set = (patch) => {
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [currentSide]: {
                    ...prev.sides[currentSide],
                    texts: (prev.sides[currentSide].texts || []).map((t) =>
                        t.id === text.id ? { ...t, ...patch } : t
                    ),
                },
            },
        }));
    };

    const minX = 0,
        maxX = purchaseData.containerWidth || 0;
    const minY = 0,
        maxY = purchaseData.containerHeight || 0;

    return (
        <div className="fixed left-0 right-0 bottom-0 bg-white p-4 rounded-t-2xl shadow-2xl z-[280]">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold">Text</h3>
                <button
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 text-white text-sm"
                    onClick={() => onDeleteActive?.()}
                >
                    <FiTrash2 /> Löschen
                </button>
            </div>

            <div className="mb-3">
                <div className="text-xs mb-1">Größe</div>
                <Slider
                    value={text.fontSize ?? 36}
                    min={10}
                    max={200}
                    step={1}
                    onChange={(_e, v) => set({ fontSize: Number(v) })}
                />
            </div>

            <div className="mb-3">
                <div className="text-xs mb-1">X</div>
                <Slider
                    value={Math.round(text.x || 0)}
                    min={minX}
                    max={maxX}
                    step={1}
                    onChange={(_e, v) => set({ x: Number(v) })}
                />
            </div>

            <div className="mb-1">
                <div className="text-xs mb-1">Y</div>
                <Slider
                    value={Math.round(text.y || 0)}
                    min={minY}
                    max={maxY}
                    step={1}
                    onChange={(_e, v) => set({ y: Number(v) })}
                />
            </div>
        </div>
    );
}
