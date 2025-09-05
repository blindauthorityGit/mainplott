import React, { useRef, useEffect, useState, forwardRef, useMemo } from "react";
import {
    Stage,
    Layer,
    Group,
    Image as KonvaImage,
    Rect,
    Transformer,
    Text,
    TextPath as KonvaTextPath,
} from "react-konva";
import useStore from "@/store/store";
import { Button } from "@mui/material";
import { FiZoomIn, FiZoomOut, FiRefreshCw, FiPlus, FiX, FiType, FiImage, FiSearch } from "react-icons/fi";
import { exportCanvas } from "@/functions/exportCanvas";
import MobileSliders from "@/components/productConfigurator/mobile/mobileSliders";
import getImagePlacement, { getFixedImagePlacement } from "@/functions/getImagePlacement";
import useIsMobile from "@/hooks/isMobile";
import Konva from "konva";
import handleAddGraphicToArray from "@/functions/handleMultiFileUpload";
import uploadGraphic from "@/functions/uploadGraphic";
import useImageObjects from "@/hooks/useImageObjects";
import { v4 as uuidv4 } from "uuid"; // npm i uuid
import { exportWithHiddenNodes } from "@/functions/exportWithHiddenNodes";
import { describeArc, clamp, centeredTextPath, measureTextPx } from "@/functions/archPath";
import { auth } from "@/config/firebase";
import { useUserAssets } from "@/hooks/useUserAsset";

const KonvaLayer = forwardRef(
    (
        {
            onExportReady,
            productImage,
            uploadedGraphicFile,
            uploadedGraphicURL,
            pdfPreview,
            isPDF,
            boundaries,
            position,
            setPosition,
            scale,
            setScale,
            initialPosition,
            resetHandler,
        },
        ref
    ) => {
        const stageRef = useRef(null);
        const productImageRef = useRef(null);
        const uploadedGraphicRef = useRef(null);
        const transformerRef = useRef(null);
        const boundaryRectRef = useRef(null);
        const tooltipRef = useRef(null);
        const hiddenFileInputRef = useRef();
        const textRefs = useRef({});
        const textTransformerRef = useRef(null);

        const stepAhead = true;

        const {
            purchaseData,
            setPurchaseData,
            setStageRef,
            setTransformerRef,
            setModalOpen,
            setShowSpinner,
            setModalContent,
            setUploadError,
            setColorSpace,
            setDpi,
            addText,
            setActiveElement,
            updateText,
        } = useStore();
        const { containerWidth, containerHeight } = purchaseData;

        const [uploading, setUploading] = useState(false);

        // NEW: Track when the images have loaded
        const [productImageLoaded, setProductImageLoaded] = useState(false);
        const [graphicLoaded, setGraphicLoaded] = useState(false);

        // Compute overall loaded state:
        const currentSide = purchaseData.currentSide || "front";
        const sideData = purchaseData.sides?.[currentSide] || {};
        const uploadedGraphics = sideData.uploadedGraphics || [];
        const activeGraphicId = sideData.activeGraphicId;
        const graphicRefs = useRef({});
        const active = purchaseData.sides?.[currentSide]?.activeElement || null;

        // TEXT STATES
        const sideTexts = sideData.texts || [];
        const [editingTextId, setEditingTextId] = useState(null);
        const [inputValue, setInputValue] = useState("");
        const fontOptions = ["Roboto", "Arial", "Impact", "Comic Sans MS", "Montserrat", "Courier New"];

        const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
        const imageSources = useMemo(() => {
            return uploadedGraphics.map((g) => {
                if (g.isPDF && g.preview) return g.preview; // PNG-Preview nutzen
                if (g.file instanceof Blob) return URL.createObjectURL(g.file);
                return g?.downloadURL || g?.url || null;
            });
        }, [uploadedGraphics]);

        const imageObjs = useImageObjects(imageSources);

        // Objekt-URLs wieder freigeben
        useEffect(() => {
            const urlsToRevoke = uploadedGraphics
                .map((g) => (g.isPDF ? null : g.file instanceof Blob ? URL.createObjectURL(g.file) : null))
                .filter(Boolean);
            return () => urlsToRevoke.forEach((u) => URL.revokeObjectURL(u));
        }, [uploadedGraphics]);

        const allGraphicsLoaded =
            uploadedGraphics.length === 0 || (imageObjs.length === uploadedGraphics.length && imageObjs.every(Boolean));
        const isImagesLoaded = productImageLoaded && allGraphicsLoaded;

        const [zoomLevel, setZoomLevel] = useState(1);
        const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
        const [isDraggingGraphic, setIsDraggingGraphic] = useState(false);
        const [isGraphicDraggable, setIsGraphicDraggable] = useState(purchaseData.configurator !== "template");

        const [transformerVisible, setTransformerVisible] = useState(false);
        const [isTemplate, setIsTemplate] = useState(purchaseData.configurator !== "template");
        useEffect(() => {
            if (transformerRef.current && activeGraphicId && graphicRefs.current[activeGraphicId]?.current) {
                transformerRef.current.nodes([graphicRefs.current[activeGraphicId].current]);
                transformerRef.current.getLayer().batchDraw();
            }
        }, [activeGraphicId, uploadedGraphics, imageObjs]);

        // DELETB BUTTONS LOGIK
        useEffect(() => {
            if (!activeGraphicId || !graphicRefs.current[activeGraphicId]?.current || !stageRef.current) {
                setButtonPos(null);
                return;
            }
            const node = graphicRefs.current[activeGraphicId].current;
            // 1. Canvas-Koordinaten holen
            let x = node.x();
            let y = node.y();
            // 2. Offset beachten (wenn zentriert wird!)
            x -= node.offsetX() * node.scaleX();
            y -= node.offsetY() * node.scaleY();
            // 3. Rechts oben am Bild
            const btnX = x + node.width() * node.scaleX();
            const btnY = y;
            // 4. In Stage-Koordinaten (Zoom/Pos beachten)
            const scale = zoomLevel;
            const stageX = stageRef.current.x() || 0;
            const stageY = stageRef.current.y() || 0;
            // 5. In den Parent-div umrechnen
            setButtonPos({
                left: btnX * scale + stageX,
                top: btnY * scale + stageY,
            });
        }, [activeGraphicId, imageObjs, zoomLevel, stagePosition]);

        // --- Hover state for the edit area ---
        const [isEditAreaHovered, setIsEditAreaHovered] = useState(false);
        const hoveredRef = useRef(false);

        const textHoverTransformerRef = useRef(null);
        const [hoveredTextId, setHoveredTextId] = useState(null);

        const fadeTimerRef = useRef(null);
        const fadeOutTimeoutRef = useRef(null); // hast du schon
        const currentTweenRef = useRef(null);

        function cancelAllTimers() {
            if (fadeTimerRef.current) {
                clearTimeout(fadeTimerRef.current);
                fadeTimerRef.current = null;
            }
            if (fadeOutTimeoutRef.current) {
                clearTimeout(fadeOutTimeoutRef.current);
                fadeOutTimeoutRef.current = null;
            }
        }

        function hideGraphicTransformer({ immediate = false } = {}) {
            cancelAllTimers();
            const tr = transformerRef.current;

            if (!tr || !tr.getStage()) {
                // <-- Guard gegen Null/Detached
                setTransformerVisible(false);
                return;
            }

            // ggf. vorherigen Tween stoppen
            if (currentTweenRef.current) {
                try {
                    currentTweenRef.current.pause();
                } catch {}
                currentTweenRef.current = null;
            }

            if (immediate) {
                tr.opacity(0);
                setTransformerVisible(false);
                tr.getLayer()?.batchDraw();
                return;
            }

            currentTweenRef.current = new Konva.Tween({
                node: tr,
                duration: 0.25,
                opacity: 0,
                onFinish: () => {
                    setTransformerVisible(false);
                    currentTweenRef.current = null;
                },
            });
            currentTweenRef.current.play();
        }

        function showTransformerFor(seconds = 4) {
            const tr = transformerRef.current;
            if (!tr || !tr.getStage()) return; // <-- Guard

            setTransformerVisible(true);
            tr.opacity(1);
            tr.getLayer()?.batchDraw();

            if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
            fadeTimerRef.current = setTimeout(() => {
                if (!hoveredRef.current) hideGraphicTransformer({ immediate: false });
            }, seconds * 1000);
        }

        useEffect(
            () => () => {
                cancelAllTimers();
                if (currentTweenRef.current) {
                    try {
                        currentTweenRef.current.pause();
                    } catch {}
                }
            },
            []
        );

        function showTransformerFor(seconds = 4) {
            setTransformerVisible(true);
            transformerRef.current?.opacity(1);
            if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
            fadeTimerRef.current = setTimeout(() => {
                if (!hoveredRef.current && transformerRef.current) {
                    new Konva.Tween({
                        node: transformerRef.current,
                        duration: 0.35,
                        opacity: 0,
                        onFinish: () => setTransformerVisible(false),
                    }).play();
                }
            }, seconds * 1000);
        }

        useEffect(() => {
            if (active?.type !== "graphic") return;
            const node = graphicRefs.current[active.id]?.current;
            if (!node) return;
            transformerRef.current?.nodes([node]);
            transformerRef.current?.getLayer().batchDraw();
            // nach dem Render sicher ein Frame warten
            requestAnimationFrame(() => showTransformerFor(4));
        }, [active, imageObjs]);

        useEffect(() => () => clearTimeout(fadeTimerRef.current), []);

        useEffect(() => {
            if (activeGraphicId && graphicRefs.current[activeGraphicId]?.current) {
                // auf das neue Node hängen
                transformerRef.current?.nodes([graphicRefs.current[activeGraphicId].current]);
                transformerRef.current?.getLayer().batchDraw();
                showTransformerFor(4);
            }
        }, [activeGraphicId]);

        useEffect(() => {
            if (!active) return;

            if (active.type === "graphic") {
                const node = graphicRefs.current[active.id]?.current;
                if (!node) return;
                transformerRef.current?.nodes([node]);
                transformerRef.current?.getLayer()?.batchDraw();
                showTransformerFor(4);
            } else {
                hideGraphicTransformer({ immediate: true }); // sofort weg beim Wechsel
            }
        }, [active, imageObjs]);

        const PADDING_RATIO = 0.08;

        function addPadding(rect, paddingRatio = PADDING_RATIO) {
            // wieviel Rand links/rechts + oben/unten
            const padW = rect.width * paddingRatio;
            const padH = rect.height * paddingRatio;

            // vergrößern & zentriert halten
            let x = rect.x - padW / 2;
            let y = rect.y - padH / 2;
            let width = rect.width + padW;
            let height = rect.height + padH;

            // sicherstellen, dass nichts über den Container hinausragt
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
        }

        useEffect(() => {
            hoveredRef.current = isEditAreaHovered;
        }, [isEditAreaHovered]);

        const isMobile = useIsMobile();

        useEffect(() => {
            setIsTemplate(purchaseData.configurator !== "template");
        }, [purchaseData.configurator]);

        // Text-Drag-Bounding: hält den gesamten Text (inkl. Scale/Rotation) im boundingRect
        const makeTextDragBound = (nodeRef) => (pos) => {
            const brNode = boundaryRectRef.current;
            const node = nodeRef?.current;
            if (!brNode || !node) return pos;

            const br = brNode.getClientRect(); // Bounding-Box (pink)
            const cr = node.getClientRect(); // aktueller Text-ClientRect (inkl. Rotation/Scale)

            // Vorgeschlagene Verschiebung
            const dx = pos.x - node.x();
            const dy = pos.y - node.y();

            // ClientRect nach der Verschiebung
            const next = {
                x: cr.x + dx,
                y: cr.y + dy,
                width: cr.width,
                height: cr.height,
            };

            let fixDx = dx;
            let fixDy = dy;

            // links
            if (next.x < br.x) fixDx += br.x - next.x;
            // oben
            if (next.y < br.y) fixDy += br.y - next.y;
            // rechts
            const brRight = br.x + br.width;
            const nextRight = next.x + next.width;
            if (nextRight > brRight) fixDx -= nextRight - brRight;
            // unten
            const brBottom = br.y + br.height;
            const nextBottom = next.y + next.height;
            if (nextBottom > brBottom) fixDy -= nextBottom - brBottom;

            // Wenn Text größer als Box ist: pinne an den linken/oberen Rand
            if (cr.width > br.width) fixDx = br.x - cr.x;
            if (cr.height > br.height) fixDy = br.y - cr.y;

            return { x: node.x() + fixDx, y: node.y() + fixDy };
        };

        // ---------------------------
        // Update config on load
        // ---------------------------
        useEffect(() => {
            setIsGraphicDraggable(purchaseData.configurator !== "template");
            if (transformerRef.current && uploadedGraphicRef.current) {
                transformerRef.current.nodes([]);
                transformerRef.current.getLayer().batchDraw();
            }
            if (purchaseData.configurator === "template") {
                handleResetZoom();
            }
        }, [purchaseData.configurator]);

        useEffect(() => {
            if (uploadedGraphicRef.current && transformerVisible) {
                transformerRef.current.nodes([uploadedGraphicRef.current]);
                transformerRef.current.getLayer().batchDraw();
            }
        }, [transformerVisible]);

        useEffect(() => {
            setStageRef(stageRef.current);
            setTransformerRef(transformerRef.current);
            return () => {
                setStageRef(null);
                setTransformerRef(null);
            };
        }, [setStageRef, setTransformerRef]);

        // ---------------------------
        // Load product image and mark as loaded
        // ---------------------------
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
                // Mark product image as loaded:
                setProductImageLoaded(true);
            };
        }, [productImage, containerWidth, containerHeight]);
        // Calculate the bounding rectangle using either the konfigBox data (if available)
        // or fall back to default values.
        // let boundingRect;
        let rawRect;

        if (purchaseData?.product?.konfigBox && purchaseData.product.konfigBox.value) {
            try {
                const konfig = JSON.parse(purchaseData.product.konfigBox.value);

                const width = konfig.width * containerWidth;
                const height = konfig.height * containerHeight;

                const x = konfig.x != null ? konfig.x * containerWidth : (containerWidth - width) / 2;

                const y = konfig.y != null ? konfig.y * containerHeight : (containerHeight - height) / 2;

                rawRect = { x, y, width, height };
            } catch (e) {
                console.error("konfigBox-JSON fehlerhaft:", e);
            }
        }

        if (!rawRect) {
            // Fallback, wenn keine / fehlerhafte konfigBox
            rawRect = {
                x: containerWidth * 0.22,
                y: containerHeight * 0.15,
                width: containerWidth * 0.67,
                height: containerHeight * 0.76,
            };
        }

        /* 3) EINMAL Padding anwenden */
        const boundingRect = addPadding(rawRect); // <-- hier Puffer drauf

        /* 4) Im State ablegen */
        // setPurchaseData((prev) => ({ ...prev, boundingRect }));
        useEffect(() => {
            setPurchaseData((prev) => ({ ...prev, boundingRect }));
        }, [boundingRect]);

        const printArea = React.useMemo(() => ({ ...boundingRect }), [boundingRect]);

        useEffect(() => {
            if (uploadedGraphicRef.current) {
                uploadedGraphicRef.current.x(position.x);
                uploadedGraphicRef.current.y(position.y);
                uploadedGraphicRef.current.getLayer().batchDraw();
            }
        }, [position.x, position.y]);

        // ---------------------------
        // Load uploaded graphic and mark as loaded
        // ---------------------------
        useEffect(() => {
            if (!uploadedGraphicFile) return;
            const currentSideData = purchaseData.sides?.[purchaseData.currentSide] || {};
            const isPDFSide = currentSideData.isPDF;
            const pdfPreviewURL = currentSideData.preview;

            function placeAndDraw(loadedImg) {
                if (!uploadedGraphicRef.current) return;

                let placement;
                if (purchaseData.product.konfigBox && purchaseData.product.konfigBox.value) {
                    placement = getFixedImagePlacement({
                        imageNaturalWidth: loadedImg.width,
                        imageNaturalHeight: loadedImg.height,
                        boundingRect,
                        centerImage: true,
                    });
                } else {
                    placement = getImagePlacement({
                        containerWidth,
                        containerHeight,
                        imageNaturalWidth: loadedImg.width,
                        imageNaturalHeight: loadedImg.height,
                    });
                }

                const offsetX = placement.finalWidth / 2;
                const offsetY = placement.finalHeight / 2;

                uploadedGraphicRef.current.width(placement.finalWidth);
                uploadedGraphicRef.current.height(placement.finalHeight);
                if (purchaseData.product.konfigBox && purchaseData.product.konfigBox.value) {
                    uploadedGraphicRef.current.x(placement.x + offsetX);
                    uploadedGraphicRef.current.y(placement.y + offsetY);
                }

                uploadedGraphicRef.current.offsetX(offsetX);
                uploadedGraphicRef.current.offsetY(offsetY);
                uploadedGraphicRef.current.image(loadedImg);
                uploadedGraphicRef.current.getLayer().batchDraw();

                setPurchaseData((prev) => ({
                    ...prev,
                    sides: {
                        ...prev.sides,
                        [prev.currentSide]: {
                            ...prev.sides[prev.currentSide],
                            width: placement.finalWidth,
                            height: placement.finalHeight,
                        },
                    },
                }));

                setGraphicLoaded(true);
                setTransformerVisible(true);
                if (transformerRef.current) transformerRef.current.opacity(1);
                if (tooltipRef.current) tooltipRef.current.opacity(1);
                setTimeout(() => {
                    if (!hoveredRef.current) {
                        if (transformerRef.current) {
                            new Konva.Tween({
                                node: transformerRef.current,
                                duration: 0.5,
                                opacity: 0,
                                onFinish: () => setTransformerVisible(false),
                            }).play();
                        } else {
                            setTransformerVisible(false);
                        }
                        if (tooltipRef.current) {
                            new Konva.Tween({
                                node: tooltipRef.current,
                                duration: 0.5,
                                opacity: 0,
                            }).play();
                        }
                    }
                }, 3000);
            }

            if (isPDFSide && pdfPreviewURL) {
                const previewImg = new window.Image();
                previewImg.crossOrigin = "anonymous";
                previewImg.src = pdfPreviewURL;
                previewImg.onload = () => placeAndDraw(previewImg);
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const normalImg = new window.Image();
                    normalImg.src = e.target.result;
                    normalImg.onload = () => placeAndDraw(normalImg);
                };
                reader.readAsDataURL(uploadedGraphicFile);
            }
        }, [uploadedGraphicFile, uploadedGraphicURL, containerWidth, containerHeight, purchaseData.currentSide]);

        // ---------------------------
        // Export logic
        // ---------------------------
        const handleExport = () => {
            handleResetZoom();

            const nodesToHide = [
                transformerRef.current,
                textTransformerRef.current,
                boundaryRectRef.current,
                tooltipRef.current,
            ];

            const dataURL = exportWithHiddenNodes({
                stageRef,
                nodes: nodesToHide,
                exportFn: () => exportCanvas(stageRef, transformerRef, null, 2),
            });

            return dataURL;
        };

        useEffect(() => {
            if (onExportReady) {
                onExportReady(handleExport);
            }
        }, [onExportReady]);

        useEffect(() => {
            console.log(purchaseData);
        }, [purchaseData]);

        // ---------------------------
        // Drag / Scale / Rotation logic for the graphic
        // ---------------------------
        const handleGraphicDragStart = () => {
            setIsDraggingGraphic(true);
        };

        const handleGraphicDragEnd = (e, id) => {
            setIsDraggingGraphic(false);
            if (isGraphicDraggable) {
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
            }
            console.log("DRAG END", purchaseData);
        };

        const handleGraphicTransform = (e) => {
            if (isGraphicDraggable) {
                const currentScale = e.target.scaleX();
                setScale(currentScale);
            }
        };

        const handleGraphicTransformEnd = (e, id) => {
            if (isGraphicDraggable) {
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
            }
        };

        function getDynamicRect() {
            const img = uploadedGraphicRef.current;
            if (!img) return printArea; // Fallback bis Grafik geladen ist

            const dx = img.offsetX() * img.scaleX();
            const dy = img.offsetY() * img.scaleY();

            return { ...printArea, x: printArea.x + dx, y: printArea.y + dy };
        }

        // ---------------------------
        // BOUNDING LOGIC
        // ---------------------------
        const dragBoundFunc = (pos) => {
            const boundingRectNode = boundaryRectRef.current;
            const shapeNode = graphicRefs.current[activeGraphicId]?.current;
            if (!boundingRectNode || !shapeNode) return pos;

            const boundingRect = boundingRectNode.getClientRect();

            const scaleX = shapeNode.scaleX?.() ?? 1;
            const scaleY = shapeNode.scaleY?.() ?? 1;
            const width = (shapeNode.width?.() ?? 0) * scaleX;
            const height = (shapeNode.height?.() ?? 0) * scaleY;
            const halfW = width / 2;
            const halfH = height / 2;

            let clampedX = pos.x;
            let clampedY = pos.y;

            if (clampedX - halfW < boundingRect.x) {
                clampedX = boundingRect.x + halfW;
            }
            if (clampedX + halfW > boundingRect.x + boundingRect.width) {
                clampedX = boundingRect.x + boundingRect.width - halfW;
            }
            if (clampedY - halfH < boundingRect.y) {
                clampedY = boundingRect.y + halfH;
            }
            if (clampedY + halfH > boundingRect.y + boundingRect.height) {
                clampedY = boundingRect.y + boundingRect.height - halfH;
            }

            return { x: clampedX, y: clampedY };
        };

        const boundBoxFunc = (oldBox, newBox) => {
            const boundingRectNode = boundaryRectRef.current;
            if (!boundingRectNode || !uploadedGraphicRef.current) return newBox;
            const boundingRect = boundingRectNode.getClientRect();
            if (
                newBox.x < boundingRect.x ||
                newBox.y < boundingRect.y ||
                newBox.x + newBox.width > boundingRect.x + boundingRect.width ||
                newBox.y + newBox.height > boundingRect.y + boundingRect.height
            ) {
                return oldBox; // revert
            }
            return newBox;
        };

        // ---------------------------
        // Reset Zoom
        // ---------------------------
        const handleResetZoom = () => {
            setZoomLevel(1);
            setStagePosition({ x: 0, y: 0 });
            if (stageRef.current) {
                stageRef.current.scale({ x: 1, y: 1 });
                stageRef.current.position({ x: 0, y: 0 });
                stageRef.current.batchDraw();
            }
        };

        useEffect(() => {
            if (resetHandler) {
                resetHandler(() => handleResetZoom());
            }
        }, [resetHandler]);

        useEffect(() => {
            handleResetZoom();
        }, [purchaseData.currentSide]);

        useEffect(() => {
            setPurchaseData((prev) => ({
                ...prev,
                boundingRect,
            }));
        }, [containerWidth, containerHeight]);

        useEffect(() => {
            if (stageRef.current) {
                stageRef.current.batchDraw();
            }
        }, [purchaseData.configurator]);

        const stageIsDraggable = !isDraggingGraphic && !isMobile;

        const handleEditAreaMouseEnter = () => {
            if (fadeOutTimeoutRef.current) {
                clearTimeout(fadeOutTimeoutRef.current);
                fadeOutTimeoutRef.current = null;
            }
            setIsEditAreaHovered(true);
            setTransformerVisible(true);
            if (transformerRef.current) transformerRef.current.opacity(1);
            if (tooltipRef.current) tooltipRef.current.opacity(1);
        };

        const handleEditAreaMouseLeave = () => {
            fadeOutTimeoutRef.current = setTimeout(() => {
                setIsEditAreaHovered(false);
                if (transformerRef.current) {
                    new Konva.Tween({
                        node: transformerRef.current,
                        duration: 0.2,
                        opacity: 0,
                        onFinish: () => setTransformerVisible(false),
                    }).play();
                } else {
                    setTransformerVisible(false);
                }
                if (tooltipRef.current) {
                    new Konva.Tween({
                        node: tooltipRef.current,
                        duration: 0.2,
                        opacity: 0,
                    }).play();
                }
            }, 100);
        };

        function handleAddGraphicClick() {
            hiddenFileInputRef.current.click();
        }

        const handleAddGraphic = async (event) => {
            const newFile = event.target.files[0];
            console.log("NEW FILE", newFile);
            if (!newFile) return;
            await uploadGraphic({
                newFile,
                currentSide: purchaseData.currentSide,
                purchaseData,
                setPurchaseData,
                setModalOpen,
                setShowSpinner,
                setModalContent,
                setUploading,
                setUploadError,
                setColorSpace,
                setDpi,
                setUploading,
                stepAhead,
            });
        };

        /* -----------------------------
           NEU: Library-Button + Panel
        ------------------------------*/

        const uid = auth.currentUser?.uid ?? null;
        const { images: assetsImages = [], loading: assetsLoading } = useUserAssets(uid);

        // Auf die Struktur mappen, die dein Insert-Handler erwartet
        const libImages = useMemo(
            () =>
                (assetsImages || []).map((i) => ({
                    id: i.id || i._id || i.url,
                    url: i.url, // hook liefert .url
                    name: i.filename || i.productTitle || i.name || "Grafik",
                })),
            [assetsImages]
        );

        // =================================================
        // NEW: Library button + Fade-in panel (graphics only)
        // =================================================
        const [libOpen, setLibOpen] = useState(false);
        const libraryWrapRef = useRef(null);

        const openLibrary = () => setLibOpen((v) => !v);

        // Hilfsfunktion: Blob vermessen
        const measureBlob = (blob) =>
            new Promise((resolve) => {
                const url = URL.createObjectURL(blob);
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

        const insertGraphicFromLibrary = async (asset) => {
            if (!asset?.url) return;

            // 1) URL -> Blob (so umgehst du CORS/Tainting und dein Hook lädt zuverlässig)
            let blob;
            try {
                const res = await fetch(asset.url, { mode: "cors", cache: "no-store" });
                if (!res.ok) throw new Error("fetch failed");
                blob = await res.blob();
            } catch (e) {
                console.error("Konnte Library-Grafik nicht als Blob laden:", e);
                return;
            }

            // 2) Natürliche Größe holen
            const dims = await measureBlob(blob);
            if (!dims) return;

            // 3) Placement wie beim Upload bestimmen
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

            // 4) In State pushen – JETZT mit width/height und zentrierter Position
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
                    file: blob, // <- wichtig: damit useImageObjects ein objectURL nutzt
                    downloadURL: asset.url,
                    url: asset.url,
                    xPosition: centerX,
                    yPosition: centerY,
                    width: finalWidth, // <- entscheidend: so wird NICHT die natürliche Größe genommen
                    height: finalHeight,
                    scale: 1,
                    rotation: 0,
                });

                side.uploadedGraphics = arr;
                side.activeGraphicId = id;
                side.activeElement = { type: "graphic", id };

                return { ...prev, sides: { ...prev.sides, [sideKey]: side } };
            });

            // optional:
            // setLibOpen(false);
        };

        return (
            <div
                className="relative"
                style={{
                    touchAction: "none",
                    opacity: productImageLoaded ? 1 : 0,
                    transition: "opacity .3s ease-in-out",
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
                    draggable={stageIsDraggable}
                    onMouseOver={() => {
                        if (stageRef.current) stageRef.current.container().style.cursor = "grab";
                    }}
                    onMouseOut={() => {
                        if (stageRef.current) stageRef.current.container().style.cursor = "default";
                    }}
                >
                    <Layer>
                        {productImage && <KonvaImage ref={productImageRef} />}
                        <Rect
                            ref={boundaryRectRef}
                            x={getDynamicRect().x}
                            y={getDynamicRect().y}
                            width={boundingRect.width}
                            height={boundingRect.height}
                        />

                        {purchaseData.configurator !== "template" &&
                            uploadedGraphics.map((g, i) => {
                                if (!graphicRefs.current[g.id]) graphicRefs.current[g.id] = React.createRef();
                                return imageObjs[i] ? (
                                    <KonvaImage
                                        key={g.id}
                                        image={imageObjs[i]}
                                        ref={graphicRefs.current[g.id]}
                                        x={g.xPosition}
                                        y={g.yPosition}
                                        rotation={g.rotation}
                                        scaleX={g.scale}
                                        scaleY={g.scale}
                                        width={g.width || imageObjs[i]?.width}
                                        height={g.height || imageObjs[i]?.height}
                                        offsetX={(g.width || imageObjs[i]?.width || 0) / 2}
                                        offsetY={(g.height || imageObjs[i]?.height || 0) / 2}
                                        draggable={isGraphicDraggable}
                                        onDragStart={handleGraphicDragStart}
                                        onDragEnd={(e) => handleGraphicDragEnd(e, g.id)}
                                        onTransform={handleGraphicTransform}
                                        onTransformEnd={(e) => handleGraphicTransformEnd(e, g.id)}
                                        dragBoundFunc={dragBoundFunc}
                                        onMouseEnter={() => {
                                            hoveredRef.current = true;
                                            setTransformerVisible(true);
                                            transformerRef.current?.opacity(1);
                                        }}
                                        onMouseLeave={() => {
                                            hoveredRef.current = false;
                                            fadeOutTimeoutRef.current = setTimeout(() => {
                                                if (!hoveredRef.current) hideGraphicTransformer({ immediate: false });
                                            }, 120);
                                        }}
                                        onClick={() => {
                                            setActiveElement(currentSide, "graphic", g.id);
                                            transformerRef.current?.nodes([graphicRefs.current[g.id].current]);
                                            transformerRef.current?.getLayer()?.batchDraw();
                                            showTransformerFor(4);
                                        }}
                                        hitFunc={(context, shape) => {
                                            const sideTolerance = 30;
                                            const topTolerance = 60;
                                            const bottomTolerance = 30;
                                            context.beginPath();
                                            context.rect(
                                                -sideTolerance,
                                                -topTolerance,
                                                shape.width() + sideTolerance * 2,
                                                shape.height() + topTolerance + bottomTolerance
                                            );
                                            context.closePath();
                                            context.fillStrokeShape(shape);
                                        }}
                                    />
                                ) : null;
                            })}

                        {sideTexts.map((t) => {
                            if (!textRefs.current[t.id]) textRefs.current[t.id] = React.createRef();

                            const fontSize = t.fontSize || 36;
                            const fontFamily = t.fontFamily || "Roboto";
                            const { width } = measureTextPx(t.value || "", fontFamily, fontSize);

                            const PAD = Math.max(6, Math.round(fontSize * 0.12));
                            const pathLength = width + 2 * PAD;
                            const pathD = centeredTextPath(pathLength, t.curvature ?? 0);
                            const centerComp = PAD;

                            return (
                                <Group
                                    key={t.id}
                                    ref={textRefs.current[t.id]}
                                    x={(t.x ?? 0) + centerComp}
                                    y={t.y ?? 0}
                                    rotation={t.rotation || 0}
                                    scaleX={t.scale || 1}
                                    scaleY={t.scale || 1}
                                    draggable={isGraphicDraggable}
                                    dragBoundFunc={makeTextDragBound(textRefs.current[t.id])}
                                    onMouseEnter={() => setHoveredTextId(t.id)}
                                    onMouseLeave={() => setHoveredTextId((id) => (id === t.id ? null : id))}
                                    onClick={() => {
                                        hideGraphicTransformer({ immediate: true });
                                        setActiveElement(currentSide, "text", t.id);
                                    }}
                                    onDragEnd={(e) => {
                                        const { x, y } = e.target.position();
                                        updateText(currentSide, t.id, { x: x - centerComp, y });
                                    }}
                                    onTransformEnd={(e) => {
                                        const node = e.target;
                                        updateText(currentSide, t.id, {
                                            scale: node.scaleX(),
                                            rotation: node.rotation(),
                                            x: node.x() - centerComp,
                                            y: node.y(),
                                        });
                                    }}
                                >
                                    <KonvaTextPath
                                        data={pathD}
                                        text={t.value}
                                        fontSize={fontSize}
                                        fontFamily={fontFamily}
                                        fill={t.fill || "#000"}
                                        listening={true}
                                    />
                                </Group>
                            );
                        })}

                        {purchaseData.configurator !== "template" &&
                            activeGraphicId &&
                            graphicRefs.current[activeGraphicId]?.current &&
                            transformerVisible && (
                                <Transformer
                                    ref={transformerRef}
                                    boundBoxFunc={boundBoxFunc}
                                    nodes={[graphicRefs.current[activeGraphicId].current]}
                                    onMouseEnter={handleEditAreaMouseEnter}
                                    onMouseLeave={handleEditAreaMouseLeave}
                                    borderStroke="#FFFFFF"
                                    anchorStroke="#A42CD6"
                                    anchorFill="#A42CD6"
                                />
                            )}

                        {active?.type === "text" && textRefs.current[active.id]?.current && (
                            <Transformer
                                ref={textTransformerRef}
                                nodes={[textRefs.current[active.id].current]}
                                enabledAnchors={[]}
                                rotateEnabled={false}
                                padding={6}
                                borderStroke="#A42CD6"
                            />
                        )}
                        {hoveredTextId && hoveredTextId !== active?.id && textRefs.current[hoveredTextId]?.current && (
                            <Transformer
                                ref={textHoverTransformerRef}
                                nodes={[textRefs.current[hoveredTextId].current]}
                                enabledAnchors={[]}
                                rotateEnabled={false}
                                padding={4}
                                borderStroke="#A42CD6"
                                borderDash={[5, 4]}
                                opacity={0.5}
                            />
                        )}
                    </Layer>
                </Stage>

                {/* Controls oben links */}
                <div className="top-8 left-0 flex-col" style={{ position: "absolute", display: "flex", gap: "10px" }}>
                    {!isMobile && (
                        <>
                            <Button
                                sx={{ minWidth: "32px", padding: "8px", fontSize: "0.875rem" }}
                                className="!bg-textColor"
                                onClick={() => {
                                    const newZoomLevel = Math.min(zoomLevel + 0.1, 3);
                                    setZoomLevel(newZoomLevel);
                                    stageRef.current.scale({ x: newZoomLevel, y: newZoomLevel });
                                    stageRef.current.batchDraw();
                                }}
                                variant="contained"
                                color="primary"
                            >
                                <FiZoomIn size={24} />
                            </Button>
                            <Button
                                sx={{ minWidth: "32px", padding: "8px", fontSize: "0.875rem" }}
                                className="!bg-textColor"
                                onClick={() => {
                                    const newZoomLevel = Math.max(zoomLevel - 0.1, 1);
                                    setZoomLevel(newZoomLevel);
                                    stageRef.current.scale({ x: newZoomLevel, y: newZoomLevel });
                                    stageRef.current.batchDraw();
                                }}
                                variant="contained"
                                color="primary"
                            >
                                <FiZoomOut size={24} />
                            </Button>
                        </>
                    )}
                    <Button
                        sx={{ minWidth: "32px", padding: "8px", fontSize: "0.875rem" }}
                        onClick={handleResetZoom}
                        variant="contained"
                        className="!bg-primaryColor-600"
                    >
                        <FiRefreshCw size={24} />
                    </Button>

                    {/* Datei hochladen */}
                    <input
                        ref={hiddenFileInputRef}
                        type="file"
                        hidden
                        onChange={handleAddGraphic}
                        accept="image/*,application/pdf"
                    />
                    <Button
                        sx={{ minWidth: "32px", padding: "8px", fontSize: "0.875rem" }}
                        className="!bg-textColor"
                        onClick={handleAddGraphicClick}
                        variant="contained"
                    >
                        <FiImage size={24} />
                    </Button>

                    {/* Text hinzufügen */}
                    <Button
                        sx={{ minWidth: "32px", padding: "8px", fontSize: "0.875rem" }}
                        className="!bg-primaryColor"
                        variant="contained"
                        onClick={() => {
                            const defaultX = boundingRect.x + boundingRect.width / 2;
                            const defaultY = boundingRect.y + boundingRect.height / 2;
                            addText(purchaseData.currentSide || "front", {
                                value: "Ihr Text",
                                x: defaultX,
                                y: defaultY,
                                fontSize: 36,
                                fontFamily: "Roboto",
                                fill: "#000",
                                rotation: 0,
                                scale: 1,
                            });
                        }}
                    >
                        <FiType size={24} />
                    </Button>

                    {/* NEU: Library öffnen/schließen */}
                    <div ref={libraryWrapRef} className="relative">
                        <Button
                            sx={{ minWidth: 32, p: 1, fontSize: "0.875rem" }}
                            className="!bg-[#ba979d]"
                            variant="contained"
                            title="Meine Grafiken"
                            onClick={openLibrary}
                        >
                            <FiSearch size={20} />
                        </Button>

                        {libOpen && (
                            <div
                                className="rounded-xl shadow-xl border bg-white"
                                style={{
                                    position: "absolute",
                                    top: 0, // gleiche Höhe wie Button
                                    left: 48, // rechts neben dem Button (~48px)
                                    width: 260,
                                    maxHeight: 320,
                                    overflowY: "auto",
                                    padding: 10,
                                    zIndex: 50,
                                    opacity: libOpen ? 1 : 0,
                                    transition: "opacity .15s ease-in-out",
                                }}
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
                                    <div className="text-sm text-gray-500 px-1 py-2">Lade …</div>
                                ) : libImages.length === 0 ? (
                                    <div className="text-xs text-gray-500 px-1 py-2">Keine Grafiken gefunden.</div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {libImages.map((a) => (
                                            <button
                                                key={a.id}
                                                onClick={() => insertGraphicFromLibrary(a)}
                                                className="flex items-center gap-3 border rounded-lg p-2 hover:bg-[#f7f2f4] transition"
                                                title={a.name || "Grafik"}
                                            >
                                                <img
                                                    src={a.url}
                                                    alt={a.name || "Grafik"}
                                                    className="w-12 h-12 object-contain rounded border"
                                                />
                                                <span className="text-xs text-gray-800 truncate">
                                                    {a.name || "Grafik"}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

KonvaLayer.displayName = "KonvaLayer";
export default KonvaLayer;
