// components/configurator/LibraryPanel.jsx
import { useMemo, useState } from "react";
import { auth } from "@/config/firebase";
import { useUserAssets } from "@/hooks/useUserAsset"; // 👈 Plural!
import { FiSearch } from "react-icons/fi";

// Transform-Normalisierung Quelle -> aktuelles Canvas
function normalizePlacement(placement, srcCanvas, dstCanvas) {
    const p = placement || { x: 300, y: 200, scale: 1, rotation: 0 };
    if (!srcCanvas?.width || !srcCanvas?.height || !dstCanvas?.width || !dstCanvas?.height) return p;
    const sx = dstCanvas.width / srcCanvas.width;
    const sy = dstCanvas.height / srcCanvas.height;
    const s = Math.min(sx, sy);
    return { x: p.x * sx, y: p.y * sy, scale: p.scale * s, rotation: p.rotation };
}

/**
 * Props:
 * - activeSide: "front" | "back"
 * - getCanvasSize: (side) => { width, height }  (optional)
 * - insertImage: ({ url, side, x, y, scale, rotation }) => void
 * - insertText:  ({ value, fontFamily, fontSize, fill, side, x, y, scale, rotation, letterSpacing, lineHeight }) => void
 */
export default function LibraryPanel({ activeSide = "front", getCanvasSize = null, insertImage, insertText }) {
    const uid = auth.currentUser?.uid || null;
    const { images, texts, loading } = useUserAssets(uid);

    const [tab, setTab] = useState("images"); // "images" | "texts"
    const [q, setQ] = useState("");

    const dstCanvas = useMemo(() => (getCanvasSize ? getCanvasSize(activeSide) : null), [getCanvasSize, activeSide]);

    const filteredImages = useMemo(() => {
        const s = q.trim().toLowerCase();
        return (images || []).filter(
            (i) =>
                !s ||
                i.url?.toLowerCase().includes(s) ||
                (i.productTitle || "").toLowerCase().includes(s) ||
                (i.orderId || "").toLowerCase().includes(s)
        );
    }, [images, q]);

    const filteredTexts = useMemo(() => {
        const s = q.trim().toLowerCase();
        return (texts || []).filter(
            (t) =>
                !s ||
                (t.value || "").toLowerCase().includes(s) ||
                (t.fontFamily || "").toLowerCase().includes(s) ||
                (t.productTitle || "").toLowerCase().includes(s) ||
                (t.orderId || "").toLowerCase().includes(s)
        );
    }, [texts, q]);

    const handleInsert = (asset) => {
        const side = asset.side || activeSide;
        const pl = normalizePlacement(asset.placement, asset.canvas, dstCanvas);

        if (asset.kind === "image") {
            insertImage?.({
                url: asset.url,
                side,
                x: pl.x,
                y: pl.y,
                scale: pl.scale,
                rotation: pl.rotation,
            });
        } else {
            insertText?.({
                value: asset.value,
                fontFamily: asset.fontFamily,
                fontSize: asset.fontSize,
                fill: asset.fill,
                side,
                x: pl.x,
                y: pl.y,
                scale: pl.scale,
                rotation: pl.rotation,
                letterSpacing: asset.letterSpacing,
                lineHeight: asset.lineHeight,
            });
        }
    };

    return (
        <div className="rounded-2xl border bg-white p-3">
            {/* Kopf: Tabs + Suche */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex rounded-xl border overflow-hidden">
                    <button
                        onClick={() => setTab("images")}
                        className={`px-3 py-1.5 text-sm ${
                            tab === "images" ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"
                        }`}
                    >
                        Grafiken
                    </button>
                    <button
                        onClick={() => setTab("texts")}
                        className={`px-3 py-1.5 text-sm ${
                            tab === "texts" ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"
                        }`}
                    >
                        Texte
                    </button>
                </div>

                <div className="relative flex-1 max-w-xs">
                    <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Suchen …"
                        className="w-full rounded-xl border pl-9 pr-3 py-2"
                    />
                </div>
            </div>

            {/* Inhalt */}
            <div className="mt-3">
                {loading ? (
                    <div className="text-gray-500">lädt…</div>
                ) : tab === "images" ? (
                    filteredImages.length === 0 ? (
                        <div className="text-gray-500">Keine Grafiken gefunden.</div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                            {filteredImages.map((img) => (
                                <button
                                    key={img.id || img.url}
                                    onClick={() => handleInsert({ ...img, kind: "image" })}
                                    className="rounded-lg border bg-gray-50 p-1 hover:shadow transition"
                                    title={img.productTitle || ""}
                                    type="button"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img.url} alt="" className="w-full aspect-square object-contain rounded" />
                                    <div className="mt-1 text-[11px] text-gray-600 truncate">
                                        {(img.titles && img.titles[0]) || img.productTitle || "—"}
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                        {(img.sides || []).join(" · ") || img.side || "—"}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )
                ) : filteredTexts.length === 0 ? (
                    <div className="text-gray-500">Keine Texte gefunden.</div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {filteredTexts.map((t, i) => (
                            <button
                                key={t.id || i}
                                onClick={() => handleInsert({ ...t, kind: "text" })}
                                className="flex items-center gap-3 rounded-lg border bg-white p-2 hover:shadow transition"
                                type="button"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-50 border">
                                    <span className="font-semibold" style={{ color: t.fill || "#111" }}>
                                        A
                                    </span>
                                </div>
                                <div className="min-w-0 text-left">
                                    <div className="text-sm font-medium truncate">{t.value || "—"}</div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {t.fontFamily || "—"} · {t.fontSize || "—"}px · {t.side || "—"}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
