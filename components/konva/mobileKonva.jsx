// components/konva/mobileKonva.jsx
import React, { useRef, useEffect, useState, useMemo, forwardRef } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Text as KonvaText } from "react-konva";
import useStore from "@/store/store";
import { FiImage, FiType, FiSearch, FiX } from "react-icons/fi";
import { BiRefresh } from "react-icons/bi";
import MobileSliders from "@/components/productConfigurator/mobile/mobileSliders";
import MobileTextSliders from "@/components/productConfigurator/mobile/mobileTextSliders";
import useImageObjects from "@/hooks/useImageObjects";
import uploadGraphic from "@/functions/uploadGraphic";
import useIsMobile from "@/hooks/isMobile";
import getImagePlacement, { getFixedImagePlacement } from "@/functions/getImagePlacement";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/config/firebase";
import { useUserAssets } from "@/hooks/useUserAsset";

const PADDING_RATIO = 0.08;

// NEU:
const DEFAULT_LINE_HEIGHT = 1;

const MobileKonvaLayer = forwardRef(function MobileKonvaLayer({ onExportReady, productImage, resetHandler }, ref) {
    const stageRef = useRef(null);
    const productImageRef = useRef(null);
    const boundaryRectRef = useRef(null);
    const uiLayerRef = useRef(null);
    const transformerRef = useRef(null);
    const textTransformerRef = useRef(null);
    const graphicRefs = useRef({});
    const textRefs = useRef({});
    const hiddenFileInputRef = useRef(null);
    const textareaRef = useRef(null);

    const {
        purchaseData,
        setPurchaseData,
        setStageRef,
        setTransformerRef,
        setActiveElement,
        updateText,
        addText,
        setModalOpen,
        setShowSpinner,
        setModalContent,
        setUploadError,
        setColorSpace,
        setDpi,
        selectedVariant,
    } = useStore();

    const isMobile = useIsMobile();
    const { containerWidth = 0, containerHeight = 0 } = purchaseData;
    const currentSide = purchaseData.currentSide || "front";
    const sideData = purchaseData.sides?.[currentSide] || {};
    const uploadedGraphics = sideData.uploadedGraphics || [];
    const activeGraphicId = sideData.activeGraphicId;
    const active = sideData.activeElement || null;
    const sideTexts = sideData.texts || [];

    // --------- Library (Meine Grafiken) ----------
    const uid = auth.currentUser?.uid ?? null;
    const { images: assetsImages = [], loading: assetsLoading } = useUserAssets(uid);
    const libImages = useMemo(
        () =>
            (assetsImages || []).map((i) => ({
                id: i.id || i._id || i.url,
                url: i.url,
                name: i.filename || i.productTitle || i.name || "Grafik",
            })),
        [assetsImages]
    );
    const [libOpen, setLibOpen] = useState(false);
    const toggleLibrary = () => setLibOpen((v) => !v);

    // --------- Bildquellen für Konva ----------
    const imageSources = useMemo(() => {
        return uploadedGraphics.map((g) => {
            if (g.isPDF && g.preview) return g.preview;
            if (g.file instanceof Blob) return URL.createObjectURL(g.file);
            return g.downloadURL || g.url || null;
        });
    }, [uploadedGraphics]);
    const imageObjs = useImageObjects(imageSources);

    const productImageSrc = useMemo(() => {
        const frontSrc = selectedVariant?.image?.originalSrc || selectedVariant?.imageUrl || productImage; // Fallback

        const backSrc = selectedVariant?.backImageUrl || selectedVariant?.imageBack?.originalSrc || frontSrc; // falls kein Back-Bild vorhanden

        return purchaseData.currentSide === "back" ? backSrc : frontSrc;
    }, [selectedVariant, productImage, purchaseData.currentSide]);

    const [productImageLoaded, setProductImageLoaded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showAlignFan, setShowAlignFan] = useState(false);

    const [zoomLevel, setZoomLevel] = useState(1);
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

    // NEU: Wenn in den Tippmodus gewechselt wird, direkt alles markieren
    useEffect(() => {
        if (isTyping && active?.type === "text" && textareaRef.current) {
            // winzige Verzögerung, bis die Textarea gerendert ist
            setTimeout(() => {
                try {
                    textareaRef.current.select();
                } catch {}
            }, 0);
        }
    }, [isTyping, active?.id]);

    // ---------- boundingRect (mit Padding) ----------
    const addPadding = (rect) => {
        const padW = rect.width * PADDING_RATIO;
        const padH = rect.height * PADDING_RATIO;
        let x = rect.x - padW / 2;
        let y = rect.y - padH / 2;
        let width = rect.width + padW;
        let height = rect.height + padH;
        if (x < 0) {
            width += x;
            x = 0;
        }
        if (y < 0) {
            height += y;
            y = 0;
        }
        if (x + width > containerWidth) width = containerWidth - x;
        if (y + height > containerHeight) height = containerHeight - y;
        return { x, y, width, height };
    };

    let rawRect;
    const konfigJson = purchaseData?.product?.konfigBox?.value;
    if (konfigJson) {
        try {
            const k = JSON.parse(konfigJson);
            const w = (k.width || 0) * containerWidth;
            const h = (k.height || 0) * containerHeight;
            const x = k.x != null ? k.x * containerWidth : (containerWidth - w) / 2;
            const y = k.y != null ? k.y * containerHeight : (containerHeight - h) / 2;
            rawRect = { x, y, width: w, height: h };
        } catch {}
    }
    if (!rawRect) {
        rawRect = {
            x: containerWidth * 0.22,
            y: containerHeight * 0.15,
            width: containerWidth * 0.67,
            height: containerHeight * 0.76,
        };
    }
    const boundingRect = addPadding(rawRect);

    const parseFontStyle = (fs) => {
        const s = (fs || "normal").toLowerCase();
        return {
            cssWeight: s.includes("bold") ? "bold" : "normal",
            cssStyle: s.includes("italic") ? "italic" : "normal",
        };
    };

    useEffect(() => {
        setPurchaseData((prev) => ({ ...prev, boundingRect }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boundingRect.x, boundingRect.y, boundingRect.width, boundingRect.height]);

    // Refs in Store
    useEffect(() => {
        setStageRef(stageRef.current);
        setTransformerRef(transformerRef.current);
        return () => {
            setStageRef(null);
            setTransformerRef(null);
        };
    }, [setStageRef, setTransformerRef]);

    // Body scroll lock je nach Edit-Mode
    useEffect(() => {
        if (typeof document !== "undefined") document.body.style.overflow = isEditing ? "hidden" : "auto";
    }, [isEditing]);

    // Produktbild laden & fitten
    useEffect(() => {
        if (!productImageSrc) return;
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = productImageSrc;
        img.onload = () => {
            if (!productImageRef.current) return;
            const containerAspect = containerWidth / containerHeight;
            const imageAspect = img.width / img.height;
            let newWidth, newHeight;
            if (imageAspect > containerAspect) {
                newWidth = containerWidth;
                newHeight = newWidth / imageAspect;
            } else {
                newHeight = containerHeight;
                newWidth = newHeight * imageAspect;
            }
            const offsetX = (containerWidth - newWidth) / 2;
            const offsetY = (containerHeight - newHeight) / 2;
            productImageRef.current.width(newWidth);
            productImageRef.current.height(newHeight);
            productImageRef.current.x(offsetX);
            productImageRef.current.y(offsetY);
            productImageRef.current.image(img);
            productImageRef.current.getLayer().batchDraw();
            setProductImageLoaded(true);
        };
    }, [productImageSrc, containerWidth, containerHeight]);

    // Transformer an aktives Element hängen
    useEffect(() => {
        if (!transformerRef.current) return;
        const node = activeGraphicId ? graphicRefs.current[activeGraphicId]?.current : null;
        if (isEditing && node && (!active || active.type !== "text")) {
            transformerRef.current.nodes([node]);
            transformerRef.current.getLayer().batchDraw();
        } else if (!active || active.type !== "text") {
            transformerRef.current.nodes([]);
        }
    }, [isEditing, activeGraphicId, active, imageObjs]);

    useEffect(() => {
        if (!textTransformerRef.current) return;
        const node = active?.type === "text" ? textRefs.current[active.id]?.current : null;
        if (isEditing && node) {
            textTransformerRef.current.nodes([node]);
            textTransformerRef.current.getLayer().batchDraw();
        } else {
            textTransformerRef.current.nodes([]);
        }
    }, [isEditing, active]);

    // Reset Zoom & Export
    const handleResetZoom = () => {
        setZoomLevel(1);
        setStagePosition({ x: 0, y: 0 });
        if (stageRef.current) {
            stageRef.current.scale({ x: 1, y: 1 });
            stageRef.current.position({ x: 0, y: 0 });
            stageRef.current.batchDraw();
        }
    };

    const handleExport = () => {
        handleResetZoom();
        const was = uiLayerRef.current?.visible?.() ?? true;
        if (uiLayerRef.current) uiLayerRef.current.visible(false);
        stageRef.current?.batchDraw();
        const dataURL = stageRef.current?.toDataURL({ pixelRatio: 2 });
        if (uiLayerRef.current) uiLayerRef.current.visible(was);
        stageRef.current?.batchDraw();
        return dataURL;
    };

    useEffect(() => {
        onExportReady && onExportReady(handleExport);
    }, [onExportReady]);
    useEffect(() => {
        resetHandler && resetHandler(() => handleResetZoom());
    }, [resetHandler]);
    useEffect(() => {
        handleResetZoom();
    }, [purchaseData.currentSide]);

    // Bounds
    const dragBoundFunc = (pos, id) => {
        const brNode = boundaryRectRef.current;
        const node = graphicRefs.current[id]?.current;
        if (!brNode || !node) return pos;
        const br = brNode.getClientRect();
        const sx = node.scaleX?.() ?? 1;
        const sy = node.scaleY?.() ?? 1;
        const w = (node.width?.() ?? 0) * sx;
        const h = (node.height?.() ?? 0) * sy;
        const halfW = w / 2;
        const halfH = h / 2;
        let x = pos.x,
            y = pos.y;
        if (x - halfW < br.x) x = br.x + halfW;
        if (x + halfW > br.x + br.width) x = br.x + br.width - halfW;
        if (y - halfH < br.y) y = br.y + halfH;
        if (y + halfH > br.y + br.height) y = br.y + br.height - halfH;
        return { x, y };
    };

    const boundBoxFunc = (oldBox, newBox) => {
        const brNode = boundaryRectRef.current;
        if (!brNode) return newBox;
        const br = brNode.getClientRect();
        if (
            newBox.x < br.x ||
            newBox.y < br.y ||
            newBox.x + newBox.width > br.x + br.width ||
            newBox.y + newBox.height > br.y + br.height
        )
            return oldBox;
        return newBox;
    };

    // Drag/Transform Grafik
    const onGraphicDragEnd = (e, id) => {
        const { x, y } = e.target.position();
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [currentSide]: {
                    ...prev.sides[currentSide],
                    uploadedGraphics: prev.sides[currentSide].uploadedGraphics.map((g) =>
                        g.id === id ? { ...g, xPosition: x, yPosition: y } : g
                    ),
                },
            },
        }));
    };
    const onGraphicTransformEnd = (e, id) => {
        const node = e.target;
        setPurchaseData((prev) => ({
            ...prev,
            sides: {
                ...prev.sides,
                [currentSide]: {
                    ...prev.sides[currentSide],
                    uploadedGraphics: prev.sides[currentSide].uploadedGraphics.map((g) =>
                        g.id === id
                            ? {
                                  ...g,
                                  xPosition: node.x(),
                                  yPosition: node.y(),
                                  scale: node.scaleX(),
                                  rotation: node.rotation(),
                              }
                            : g
                    ),
                },
            },
        }));
    };

    // Stage click -> Edit-Mode aus
    const handleStageClick = (e) => {
        const target = e?.target;
        const isGraphic = typeof target?.name === "function" && target.name() === "graphic";
        const isText = typeof target?.getClassName === "function" && target.getClassName() === "Text";
        const clickedOnEmpty = !isGraphic && !isText;

        if (clickedOnEmpty) {
            setIsTyping(false);
            setIsEditing(false);
            setPurchaseData((prev) => ({
                ...prev,
                sides: {
                    ...prev.sides,
                    [currentSide]: {
                        ...prev.sides[currentSide],
                        activeElement: null,
                        activeGraphicId: null,
                    },
                },
            }));
        }
    };

    // Upload & Text
    const handleAddGraphicClick = () => hiddenFileInputRef.current?.click();
    const handleAddGraphic = async (event) => {
        const newFile = event.target.files?.[0];
        if (!newFile) return;
        await uploadGraphic({
            newFile,
            currentSide: purchaseData.currentSide,
            purchaseData,
            setPurchaseData,
            setModalOpen,
            setShowSpinner,
            setModalContent,
            setUploadError,
            setColorSpace,
            setDpi,
            stepAhead: false,
        });
        setIsEditing(true);
        event.target.value = "";
    };
    const handleAddText = () => {
        const defaultX = boundingRect.x + boundingRect.width / 2;
        const defaultY = boundingRect.y + boundingRect.height / 2;
        addText(currentSide, {
            value: "Doppelklick zum Bearbeiten",
            x: defaultX,
            y: defaultY,
            fontSize: 18,
            fontFamily: "Roboto",
            fill: "#000",
            rotation: 0,
            scale: 1,
            boxWidth: Math.min(boundingRect.width, containerWidth * 0.85),
        });
        setIsEditing(true);
    };

    // Aktives löschen
    const deleteActive = () => {
        if (active?.type === "graphic" && activeGraphicId) {
            setPurchaseData((prev) => ({
                ...prev,
                sides: {
                    ...prev.sides,
                    [currentSide]: {
                        ...prev.sides[currentSide],
                        uploadedGraphics: (prev.sides[currentSide].uploadedGraphics || []).filter(
                            (g) => g.id !== activeGraphicId
                        ),
                        activeGraphicId: null,
                        activeElement: null,
                    },
                },
            }));
            // ⬇️ Edit-Mode verlassen -> FABs werden sofort sichtbar
            setIsTyping(false);

            setIsEditing(false);
            return;
        }

        if (active?.type === "text" && active.id) {
            setPurchaseData((prev) => ({
                ...prev,
                sides: {
                    ...prev.sides,
                    [currentSide]: {
                        ...prev.sides[currentSide],
                        texts: (prev.sides[currentSide].texts || []).filter((t) => t.id !== active.id),
                        activeElement: null,
                    },
                },
            }));
            // ⬇️ Edit-Mode verlassen -> FABs werden sofort sichtbar
            setIsEditing(false);
        }
    };

    // Touch/Scroll Verhalten
    useEffect(() => {
        const c = stageRef.current?.container();
        if (!c) return;

        c.style.touchAction = isEditing ? "none" : "pan-y";

        const swallowMove = (e) => {
            if (!isEditing) {
                e.stopImmediatePropagation?.();
            }
        };

        c.addEventListener("touchmove", swallowMove, { capture: true, passive: true });
        c.addEventListener("pointermove", swallowMove, { capture: true, passive: true });

        return () => {
            c.removeEventListener("touchmove", swallowMove, { capture: true });
            c.removeEventListener("pointermove", swallowMove, { capture: true });
        };
    }, [isEditing]);

    // build text refs
    sideTexts.forEach((t) => {
        if (!textRefs.current[t.id]) textRefs.current[t.id] = React.createRef();
    });

    const isImagesLoaded =
        productImageLoaded &&
        (uploadedGraphics.length === 0 || (imageObjs.length === uploadedGraphics.length && imageObjs.every(Boolean)));

    // -------- Library: Grafik aus Bibliothek einfügen (platzieren wie Desktop) ----------
    async function insertGraphicFromLibrary(asset) {
        if (!asset?.url) return;

        // 1) URL -> Blob
        let blob;
        try {
            const res = await fetch(asset.url, { mode: "cors", cache: "no-store" });
            if (!res.ok) throw new Error("fetch failed");
            blob = await res.blob();
        } catch (e) {
            console.error("Konnte Library-Grafik nicht laden:", e);
            return;
        }

        const measureBlob = (b) =>
            new Promise((resolve) => {
                const url = URL.createObjectURL(b);
                const img = new window.Image();
                img.onload = () => {
                    resolve({ w: img.width, h: img.height });
                    URL.revokeObjectURL(url);
                };
                img.onerror = () => {
                    resolve(null);
                    URL.revokeObjectURL(url);
                };
                img.src = url;
            });

        const dims = await measureBlob(blob);
        if (!dims) return;

        const hasKonfig = !!(purchaseData?.product?.konfigBox && purchaseData.product.konfigBox.value);
        const placement = hasKonfig
            ? getFixedImagePlacement({
                  imageNaturalWidth: dims.w,
                  imageNaturalHeight: dims.h,
                  boundingRect,
                  centerImage: true,
              })
            : getImagePlacement({
                  containerWidth,
                  containerHeight,
                  imageNaturalWidth: dims.w,
                  imageNaturalHeight: dims.h,
              });

        const { finalWidth, finalHeight, x, y } = placement;
        const id = uuidv4();

        setPurchaseData((prev) => {
            const sideKey = prev.currentSide || "front";
            const side = { ...(prev.sides?.[sideKey] || {}) };
            const arr = Array.isArray(side.uploadedGraphics) ? [...side.uploadedGraphics] : [];

            const centerX = (x ?? boundingRect.x) + finalWidth / 2;
            const centerY = (y ?? boundingRect.y) + finalHeight / 2;

            arr.push({
                id,
                type: "upload",
                name: asset.name || null,
                file: blob,
                downloadURL: asset.url,
                url: asset.url,
                xPosition: centerX,
                yPosition: centerY,
                width: finalWidth,
                height: finalHeight,
                scale: 1,
                rotation: 0,
            });

            side.uploadedGraphics = arr;
            side.activeGraphicId = id;
            side.activeElement = { type: "graphic", id };

            return { ...prev, sides: { ...prev.sides, [sideKey]: side } };
        });

        setIsEditing(true);
        setLibOpen(false);
    }

    return (
        <div
            className="relative"
            style={{
                touchAction: isEditing ? "none" : "pan-y",
                opacity: isImagesLoaded ? 1 : 0,
                transition: "opacity 0.3s ease-in-out",
            }}
        >
            {/* === Textbearbeitung über textarea (mobile) === */}
            {isTyping &&
                isEditing &&
                active?.type === "text" &&
                active.id &&
                (() => {
                    const t = sideTexts.find((tt) => tt.id === active.id);
                    if (!t) return null;
                    const { cssWeight, cssStyle } = parseFontStyle(t.fontStyle);
                    const editWidth = t.boxWidth || boundingRect.width;
                    const left = t.x - editWidth / 2; // 👈 center X like offsetX does

                    return (
                        <textarea
                            ref={textareaRef}
                            value={t.value || ""}
                            onChange={(e) => updateText(currentSide, active.id, { value: e.target.value })}
                            onBlur={() => setIsTyping(false)}
                            onMouseUp={(e) => {
                                const w = Math.round(e.currentTarget.clientWidth);
                                if (w && w !== editWidth) {
                                    updateText(currentSide, active.id, { boxWidth: Math.min(w, boundingRect.width) });
                                }
                            }}
                            onTouchEnd={(e) => {
                                const el = e.currentTarget;
                                const w = Math.round(el.clientWidth);
                                if (w && w !== editWidth) {
                                    updateText(currentSide, active.id, { boxWidth: Math.min(w, boundingRect.width) });
                                }
                            }}
                            autoFocus
                            spellCheck={false}
                            className="absolute z-[9999] font-body"
                            style={{
                                position: "absolute",
                                top: `${t.y}px`,
                                left: `${left}px`,
                                width: `${editWidth}px`,
                                maxWidth: `${boundingRect.width}px`,
                                minWidth: "80px",

                                // Typografie 1:1 wie Konva
                                fontSize: `${t.fontSize ?? defaultFontSize}px`,
                                fontFamily: t.fontFamily || "Roboto",
                                fontWeight: cssWeight,
                                fontStyle: cssStyle,
                                letterSpacing: t.letterSpacing ?? 0,
                                lineHeight: t.lineHeight ?? DEFAULT_LINE_HEIGHT,
                                color: t.fill || "#000000",
                                textAlign: t.align || "left",

                                // Optik: randlos, kein Outline / Focus-Ring
                                background: "transparent",
                                border: "none",
                                outline: "none",
                                boxShadow: "none",

                                // UX
                                padding: 0, // kein Extra-Padding -> gleiche Box wie Konva
                                resize: "both",
                                overflow: "auto",
                                caretColor: "#000",
                                // iOS Zoom-Verhalten etwas beruhigen (optional)
                                WebkitTextSizeAdjust: "100%",
                            }}
                        />
                    );
                })()}

            <Stage
                ref={stageRef}
                className="mix-blend-multiply"
                width={containerWidth}
                height={containerHeight}
                scaleX={zoomLevel}
                scaleY={zoomLevel}
                x={stagePosition.x}
                y={stagePosition.y}
                draggable={false}
                onClick={handleStageClick}
                onTap={handleStageClick}
                onTouchMove={(e) => {
                    if (isEditing && e?.evt?.preventDefault) e.evt.preventDefault();
                }}
                style={{ touchAction: isEditing ? "none" : "pan-y" }}
            >
                <Layer>
                    {productImage && <KonvaImage ref={productImageRef} />}

                    {/* Grafiken */}
                    {uploadedGraphics.map((g, idx) => {
                        if (!graphicRefs.current[g.id]) graphicRefs.current[g.id] = React.createRef();
                        const image = imageObjs[idx];
                        if (!image) return null;
                        return (
                            <KonvaImage
                                key={g.id}
                                ref={graphicRefs.current[g.id]}
                                name="graphic"
                                image={image}
                                x={g.xPosition}
                                y={g.yPosition}
                                width={g.width}
                                height={g.height}
                                scaleX={g.scale}
                                scaleY={g.scale}
                                rotation={g.rotation}
                                offsetX={(g.width ?? 0) / 2}
                                offsetY={(g.height ?? 0) / 2}
                                draggable={isEditing && (!active || active.type !== "text")}
                                dragBoundFunc={(pos) => dragBoundFunc(pos, g.id)}
                                onMouseDown={() => {
                                    setIsEditing(true);
                                    setActiveElement(currentSide, "graphic", g.id);
                                }}
                                onTouchStart={() => {
                                    setIsEditing(true);
                                    setActiveElement(currentSide, "graphic", g.id);
                                }}
                                onDragEnd={(e) => onGraphicDragEnd(e, g.id)}
                                onTransformEnd={(e) => onGraphicTransformEnd(e, g.id)}
                                hitStrokeWidth={30}
                            />
                        );
                    })}

                    {/* Texte */}
                    {sideTexts.map((t) => {
                        const boxWidth = t.boxWidth || boundingRect.width; // 👈
                        return (
                            <KonvaText
                                key={t.id}
                                ref={textRefs.current[t.id] || (textRefs.current[t.id] = React.createRef())}
                                text={t.value}
                                x={t.x}
                                y={t.y}
                                fontStyle={t.fontStyle || "normal"}
                                fontSize={t.fontSize || 36}
                                lineHeight={t.lineHeight ?? DEFAULT_LINE_HEIGHT}
                                fontFamily={t.fontFamily || "Roboto"}
                                fill={t.fill || "#000"}
                                align={t.align || "left"}
                                width={boundingRect.width}
                                offsetX={boundingRect.width / 2}
                                rotation={t.rotation || 0}
                                scaleX={t.scale || 1}
                                scaleY={t.scale || 1}
                                opacity={isTyping && active?.type === "text" && active.id === t.id ? 0 : 1} // 👈 Doppelung verhindern
                                draggable={
                                    // Nur draggen, wenn Text aktiv UND wir NICHT tippen
                                    isEditing && active?.type === "text" && active.id === t.id && !isTyping
                                }
                                dragBoundFunc={(pos) => {
                                    /* dein existing Bound-Code unverändert */
                                }}
                                onClick={(e) => {
                                    e.cancelBubble = true;
                                    setIsEditing(true); // Controls sichtbar
                                    setIsTyping(false); // nicht tippen, nur selektieren
                                    setActiveElement(currentSide, "text", t.id);
                                }}
                                onTap={(e) => {
                                    e.cancelBubble = true;
                                    setIsEditing(true);
                                    setIsTyping(false); // Tap: nur selektieren
                                    setActiveElement(currentSide, "text", t.id);
                                }}
                                onDblClick={(e) => {
                                    e.cancelBubble = true;
                                    setIsEditing(true);
                                    setIsTyping(true); // Doppeltap: tippen
                                    setActiveElement(currentSide, "text", t.id);
                                }}
                                onDblTap={(e) => {
                                    e.cancelBubble = true;
                                    setIsEditing(true);
                                    setIsTyping(true); // Mobile: dbltap
                                    setActiveElement(currentSide, "text", t.id);
                                }}
                                onDragEnd={(e) => {
                                    const { x, y } = e.target.position();
                                    updateText(currentSide, t.id, { x, y });
                                }}
                                onTransformEnd={(e) => {
                                    const node = e.target;
                                    updateText(currentSide, t.id, {
                                        scale: node.scaleX(),
                                        rotation: node.rotation(),
                                        x: node.x(),
                                        y: node.y(),
                                    });
                                }}
                                hitStrokeWidth={30}
                            />
                        );
                    })}
                </Layer>

                {/* UI-Layer */}
                <Layer ref={uiLayerRef} listening={true}>
                    <Rect
                        ref={boundaryRectRef}
                        x={boundingRect.x}
                        y={boundingRect.y}
                        width={boundingRect.width}
                        height={boundingRect.height}
                        listening={false}
                        hitStrokeWidth={0}
                    />

                    {isEditing &&
                        (!active || active.type !== "text") &&
                        activeGraphicId &&
                        graphicRefs.current[activeGraphicId]?.current && (
                            <Transformer
                                ref={transformerRef}
                                nodes={[graphicRefs.current[activeGraphicId].current]}
                                boundBoxFunc={boundBoxFunc}
                                borderStroke="#FFFFFF"
                                anchorStroke="#A42CD6"
                                anchorFill="#A42CD6"
                            />
                        )}

                    {isEditing && active?.type === "text" && textRefs.current[active.id]?.current && (
                        <Transformer
                            ref={textTransformerRef}
                            nodes={[textRefs.current[active.id].current]}
                            enabledAnchors={[]}
                            rotateEnabled={true}
                            padding={6}
                            borderStroke="#A42CD6"
                        />
                    )}
                </Layer>
            </Stage>

            {/* Mobile Controls (rechts) */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    transition: "opacity 0.2s ease-in-out",
                    opacity: isEditing ? 1 : 0,
                    pointerEvents: isEditing ? "auto" : "none",
                    zIndex: 9999,
                }}
            >
                <MobileSliders
                    zoomLevel={zoomLevel}
                    setZoomLevel={(val) => {
                        const clamped = Math.max(1, Math.min(val, 3));
                        setZoomLevel(clamped);
                        stageRef.current?.scale({ x: clamped, y: clamped });
                        stageRef.current?.batchDraw();
                    }}
                    onDeleteActive={deleteActive}
                />
            </div>

            {/* Text-Slider unten */}
            {/* {isEditing && active?.type === "text" && (
                <MobileTextSliders boundingRect={boundingRect} onDeleteActive={deleteActive} />
            )} */}

            {/* FABs: Upload / Text / Bibliothek (ausgeblendet im Edit-Mode) */}
            <div
                className="flex flex-col gap-3"
                style={{
                    position: "absolute",
                    right: 12,
                    top: "35%",
                    transform: "translateY(-50%)",
                    zIndex: 220,
                    pointerEvents: isEditing ? "none" : "auto",
                    opacity: isEditing ? 0 : 1,
                    transition: "opacity .2s",
                }}
            >
                <button
                    onClick={handleAddGraphicClick}
                    className="bg-gray-800 text-white p-3 rounded-full shadow-md"
                    aria-label="Grafik hochladen"
                >
                    <FiImage size={20} />
                </button>
                <button
                    onClick={handleAddText}
                    className="bg-gray-800 text-white p-3 rounded-full shadow-md"
                    aria-label="Text hinzufügen"
                >
                    <FiType size={20} />
                </button>
                <button
                    onClick={toggleLibrary}
                    className="bg-[#ba979d] text-white p-3 rounded-full shadow-md"
                    aria-label="Meine Grafiken"
                >
                    <FiSearch size={18} />
                </button>
                <input
                    ref={hiddenFileInputRef}
                    type="file"
                    hidden
                    accept="image/*,application/pdf"
                    onChange={handleAddGraphic}
                />
            </div>

            {/* Seitenwechsel – ausgeblendet im Edit-Mode */}
            <button
                onClick={() => {
                    setIsTyping(false);
                    setPurchaseData((p) => ({ ...p, currentSide: p.currentSide === "front" ? "back" : "front" }));
                }}
                className="absolute -top-1 right-4 bg-white p-2 text-textColor rounded-full shadow-md"
                style={{ opacity: isEditing ? 0 : 1, zIndex: 300, pointerEvents: isEditing ? "none" : "auto" }}
                aria-label="Seite wechseln"
            >
                <BiRefresh size={24} />
            </button>

            {/* Library Drawer */}
            {libOpen && (
                <div
                    className="absolute top-3 right-3 w-64 max-h-[60vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3 shadow-xl z-[10000]"
                    role="dialog"
                    aria-label="Meine Grafiken"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <FiSearch /> <span>Meine Grafiken</span>
                        </div>
                        <button
                            className="p-1 rounded hover:bg-gray-100"
                            onClick={() => setLibOpen(false)}
                            title="Schließen"
                        >
                            <FiX size={16} />
                        </button>
                    </div>

                    {assetsLoading ? (
                        <div className="text-sm text-gray-500">Lade …</div>
                    ) : libImages.length === 0 ? (
                        <div className="text-xs text-gray-500">Keine Grafiken gefunden.</div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {libImages.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => insertGraphicFromLibrary(a)}
                                    className="flex items-center gap-3 border rounded-lg p-2 hover:bg-[#f7f2f4] transition text-left"
                                    title={a.name || "Grafik"}
                                >
                                    <img
                                        src={a.url}
                                        alt={a.name || "Grafik"}
                                        className="w-12 h-12 object-contain rounded border"
                                    />
                                    <span className="text-xs text-gray-800 truncate">{a.name || "Grafik"}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export default MobileKonvaLayer;
