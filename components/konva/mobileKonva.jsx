import React, { useRef, useEffect, useState, useMemo, forwardRef } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Text as KonvaText } from "react-konva";
import useStore from "@/store/store";
import { FiImage, FiType } from "react-icons/fi";
import { BiRefresh } from "react-icons/bi";
import MobileSliders from "@/components/productConfigurator/mobile/mobileSliders"; // ← aktualisiert
import MobileTextSliders from "@/components/productConfigurator/mobile/mobileTextSliders"; // ← aktualisiert
import useImageObjects from "@/hooks/useImageObjects";
import uploadGraphic from "@/functions/uploadGraphic";
import useIsMobile from "@/hooks/isMobile";

const PADDING_RATIO = 0.08;

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
    } = useStore();

    const isMobile = useIsMobile();
    const { containerWidth = 0, containerHeight = 0 } = purchaseData;
    const currentSide = purchaseData.currentSide || "front";
    const sideData = purchaseData.sides?.[currentSide] || {};
    const uploadedGraphics = sideData.uploadedGraphics || [];
    const activeGraphicId = sideData.activeGraphicId;
    const active = sideData.activeElement || null;
    const sideTexts = sideData.texts || [];

    const imageSources = useMemo(() => {
        return uploadedGraphics.map((g) => {
            if (g.isPDF && g.preview) return g.preview;
            if (g.file instanceof Blob) return URL.createObjectURL(g.file);
            return g.downloadURL || null;
        });
    }, [uploadedGraphics]);

    const imageObjs = useImageObjects(imageSources);

    const [productImageLoaded, setProductImageLoaded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

    // ---- boundingRect (mit Padding)
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

    // Body scroll lock
    useEffect(() => {
        if (typeof document !== "undefined") document.body.style.overflow = isEditing ? "hidden" : "auto";
    }, [isEditing]);

    // Produktbild
    useEffect(() => {
        if (!productImage) return;
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = productImage;
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
    }, [productImage, containerWidth, containerHeight]);

    // Auto-Edit wenn ein Element existiert (und noch nicht im Edit-Mode)
    // useEffect(() => {
    //     if (!isEditing && (uploadedGraphics.length > 0 || sideTexts.length > 0)) setIsEditing(true);
    // }, [uploadedGraphics.length, sideTexts.length, isEditing]);

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

    // Export
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
        if (isEditing && e.target.name() !== "graphic" && !(active && active.type === "text")) {
            setIsEditing(false);
            // aktive Auswahl aufheben
            setPurchaseData((prev) => ({
                ...prev,
                sides: {
                    ...prev.sides,
                    [currentSide]: { ...prev.sides[currentSide], activeElement: null, activeGraphicId: null },
                },
            }));
        }
    };

    // Add graphic / text (+ FABs hide in edit mode)
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
            value: "Text hier bearbeiten",
            x: defaultX,
            y: defaultY,
            fontSize: 36,
            fontFamily: "Roboto",
            fill: "#000",
            rotation: 0,
            scale: 1,
        });
        setIsEditing(true);
    };

    // Löschen aktives
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
        }
    };

    // in MobileKonvaLayer
    useEffect(() => {
        const c = stageRef.current?.container();
        if (!c) return;

        c.style.touchAction = isEditing ? "none" : "pan-y";

        const swallowMove = (e) => {
            if (!isEditing) {
                // verhindert, dass Konva den Move sieht -> Seite kann scrollen
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

    return (
        <div
            className="relative"
            style={{
                touchAction: isEditing ? "none" : "pan-y", // <— wichtig
                opacity: isImagesLoaded ? 1 : 0,
                transition: "opacity 0.3s ease-in-out",
            }}
        >
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
                style={{ touchAction: isEditing ? "none" : "pan-y" }} // ← entscheidend
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
                    {sideTexts.map((t) => (
                        <KonvaText
                            key={t.id}
                            ref={textRefs.current[t.id]}
                            text={t.value}
                            x={t.x}
                            y={t.y}
                            fontSize={t.fontSize || 36}
                            fontFamily={t.fontFamily || "Roboto"}
                            fill={t.fill || "#000"}
                            rotation={t.rotation || 0}
                            scaleX={t.scale || 1}
                            scaleY={t.scale || 1}
                            draggable={isEditing && active && active.type === "text" && active.id === t.id}
                            dragBoundFunc={(pos) => {
                                const brNode = boundaryRectRef.current;
                                const node = textRefs.current[t.id]?.current;
                                if (!brNode || !node) return pos;
                                const br = brNode.getClientRect();
                                const cr = node.getClientRect();
                                const dx = pos.x - node.x();
                                const dy = pos.y - node.y();
                                const next = { x: cr.x + dx, y: cr.y + dy, width: cr.width, height: cr.height };
                                let fixDx = dx,
                                    fixDy = dy;
                                if (next.x < br.x) fixDx += br.x - next.x;
                                if (next.y < br.y) fixDy += br.y - next.y;
                                const brRight = br.x + br.width;
                                const nextRight = next.x + next.width;
                                if (nextRight > brRight) fixDx -= nextRight - brRight;
                                const brBottom = br.y + br.height;
                                const nextBottom = next.y + next.height;
                                if (nextBottom > brBottom) fixDy -= nextBottom - brBottom;
                                if (cr.width > br.width) fixDx = br.x - cr.x;
                                if (cr.height > br.height) fixDy = br.y - cr.y;
                                return { x: node.x() + fixDx, y: node.y() + fixDy };
                            }}
                            onClick={(e) => {
                                e.cancelBubble = true;
                                setIsEditing(true);
                                setActiveElement(currentSide, "text", t.id);
                            }}
                            onTap={(e) => {
                                e.cancelBubble = true;
                                setIsEditing(true);
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
                    ))}
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

            {/* Mobile Controls (sichtbar im Edit-Mode) */}
            <div
                style={{
                    position: "absolute",
                    top: 0, // vorher: 0
                    right: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    transition: "opacity 0.2s ease-in-out",
                    opacity: isEditing ? 1 : 0,
                    pointerEvents: isEditing ? "auto" : "none",
                    zIndex: 9999, // vorher: 250
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

            {/* Text-Controls unten (nur wenn aktiver Text) */}
            {isEditing && active?.type === "text" && (
                <MobileTextSliders boundingRect={boundingRect} onDeleteActive={deleteActive} />
            )}

            {/* FABs: Upload/Text (blenden aus, wenn Edit-Mode) */}
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
                onClick={() =>
                    setPurchaseData((p) => ({ ...p, currentSide: p.currentSide === "front" ? "back" : "front" }))
                }
                className="absolute -top-1 right-4 bg-white p-2 text-textColor rounded-full shadow-md"
                style={{ opacity: isEditing ? 0 : 1, zIndex: 300, pointerEvents: isEditing ? "none" : "auto" }}
                aria-label="Seite wechseln"
            >
                <BiRefresh size={24} />
            </button>
        </div>
    );
});

export default MobileKonvaLayer;
