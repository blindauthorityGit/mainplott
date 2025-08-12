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
import { FiZoomIn, FiZoomOut, FiRefreshCw, FiPlus, FiX, FiType, FiImage } from "react-icons/fi";
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
import { describeArc, clamp, centeredTextPath } from "@/functions/archPath";

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
                return g.downloadURL || null;
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
        const fadeOutTimeoutRef = useRef(null);
        const hoveredRef = useRef(false);
        const fadeTimerRef = useRef(null);

        const textHoverTransformerRef = useRef(null);
        const [hoveredTextId, setHoveredTextId] = useState(null);

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

        // console.log("KONFIG BOX:", purchaseData?.product?.konfigBox);

        // if (purchaseData?.product?.konfigBox && purchaseData?.product?.konfigBox?.value) {
        //     try {
        //         // Parse the JSON from konfigBox. Expected format: {"width": 1, "height": 0.128}
        //         const konfig = JSON.parse(purchaseData.product.konfigBox.value);
        //         // Multiply the parsed relative values by container dimensions.
        //         const width = konfig.width * containerWidth;
        //         const height = konfig.height * containerHeight;

        //         // Center the bounding box. (Alternatively, you can calculate x and y differently if needed.)
        //         const x = konfig?.x ? konfig.x * containerWidth : (containerWidth - width) / 2;

        //         // const y = (containerHeight - height) / 2;
        //         // Use konfig.y if defined, otherwise center vertically:
        //         const y = konfig.y !== undefined ? konfig.y * containerHeight : (containerHeight - height) / 2;
        //         boundingRect = { x, y, width, height };
        //         console.log(boundingRect);

        //         setPurchaseData((prev) => ({
        //             ...prev,
        //             boundingRect: { x, y, width, height },
        //         }));
        //     } catch (error) {
        //         console.error("Error parsing konfigBox JSON:", error);
        //         // Fallback to the default values if parsing fails.
        //         boundingRect = {
        //             x: containerWidth * 0.22,
        //             y: containerHeight * 0.15,
        //             width: containerWidth * 0.55,
        //             height: containerHeight * 0.76,
        //         };

        //         setPurchaseData((prev) => ({
        //             ...prev,
        //             boundingRect: {
        //                 x: containerWidth * 0.22,
        //                 y: containerHeight * 0.15,
        //                 width: containerWidth * 0.55,
        //                 height: containerHeight * 0.76,
        //             },
        //         }));
        //     }
        // } else {
        //     // If there's no konfigBox provided, use the default values.
        //     boundingRect = {
        //         x: containerWidth * 0.22,
        //         y: containerHeight * 0.15,
        //         width: containerWidth * 0.55,
        //         height: containerHeight * 0.76,
        //     };

        //     const padW = containerWidth * PADDING_RATIO; //  z. B. 8 % von width
        //     const padH = containerHeight * PADDING_RATIO;

        //     setPurchaseData((prev) => ({
        //         ...prev,
        //         boundingRect: {
        //             x: containerWidth * 0.22,
        //             y: containerHeight * 0.15,
        //             width: Math.min(containerWidth - (x - padW / 2), width + padW),
        //             height: Math.min(containerHeight - (y - padH / 2), height + padH),
        //         },
        //     }));
        // }

        const printArea = React.useMemo(() => ({ ...boundingRect }), [boundingRect]);

        // console.log(boundingRect);

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
                // If the product has a konfigBox, use the new logic:
                if (purchaseData.product.konfigBox && purchaseData.product.konfigBox.value) {
                    placement = getFixedImagePlacement({
                        imageNaturalWidth: loadedImg.width,
                        imageNaturalHeight: loadedImg.height,
                        // 'boundingRect' is already computed earlier in your component (based on konfigBox or defaults)
                        boundingRect,
                        centerImage: true,
                    });
                } else {
                    // Otherwise, fall back to your original helper.

                    placement = getImagePlacement({
                        containerWidth,
                        containerHeight,
                        imageNaturalWidth: loadedImg.width,
                        imageNaturalHeight: loadedImg.height,
                    });
                }

                console.log("PLACEMENT", placement);
                console.log("KONFIG BOX", purchaseData.product.konfigBox);
                const offsetX = placement.finalWidth / 2;
                const offsetY = placement.finalHeight / 2;
                // const offsetX = placement.finalWidth / 2;
                // const offsetY = placement.finalHeight / 2;
                // Apply the placement values to your graphic:

                uploadedGraphicRef.current.width(placement.finalWidth);
                uploadedGraphicRef.current.height(placement.finalHeight);
                if (purchaseData.product.konfigBox && purchaseData.product.konfigBox.value) {
                    uploadedGraphicRef.current.x(placement.x + offsetX);
                    uploadedGraphicRef.current.y(placement.y + offsetY);
                }
                // Optionally, set offsets for rotation:
                // uploadedGraphicRef.current.offsetX(0);
                // uploadedGraphicRef.current.offsetY(0);

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

                console.log(purchaseData.sides.back);

                // Mark graphic as loaded and handle transformer visibility, etc.
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

            // Alles, was im Export nicht zu sehen sein soll:
            const nodesToHide = [
                transformerRef.current, // Bild-Transformer
                textTransformerRef.current, // Text-Transformer (dein "Rahmen um den Text")
                boundaryRectRef.current, // Print-Area-Rahmen
                tooltipRef.current, // falls vorhanden
            ];

            // call exportCanvas wie bisher – nur eingewickelt
            const dataURL = exportWithHiddenNodes({
                stageRef,
                nodes: nodesToHide,
                exportFn: () => exportCanvas(stageRef, transformerRef, null, 2), // pixelRatio 2 empfohlen
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

        // const handleGraphicDragEnd = (e) => {
        //     setIsDraggingGraphic(false);

        //     if (isGraphicDraggable) {
        //         setPosition({ x: e.target.x(), y: e.target.y() }, e.target.rotation());
        //     }
        // };
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

        // Update parent's scale continuously so slider stays in sync
        const handleGraphicTransform = (e) => {
            if (isGraphicDraggable) {
                const currentScale = e.target.scaleX(); // assuming uniform scale
                setScale(currentScale);
            }
        };

        // const handleGraphicTransformEnd = (e) => {
        //     if (isGraphicDraggable) {
        //         const newScale = Math.min(e.target.scaleX(), 5.5);
        //         setScale(newScale);
        //         e.target.scaleX(newScale);
        //         e.target.scaleY(newScale);
        //         const newRotation = e.target.rotation();
        //         setPosition({ x: e.target.x(), y: e.target.y() }, newRotation);
        //         e.target.getLayer().batchDraw();
        //     }
        // };

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

            // Offset * aktueller Scale -> reale Verschiebung
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

            // WICHTIG: aktuelle scale berücksichtigen!
            const scaleX = shapeNode.scaleX?.() ?? 1;
            const scaleY = shapeNode.scaleY?.() ?? 1;
            const width = (shapeNode.width?.() ?? 0) * scaleX;
            const height = (shapeNode.height?.() ?? 0) * scaleY;
            const halfW = width / 2;
            const halfH = height / 2;

            let clampedX = pos.x;
            let clampedY = pos.y;

            // Links: Mittelpunkt >= linker Rand + halbe Breite
            if (clampedX - halfW < boundingRect.x) {
                clampedX = boundingRect.x + halfW;
            }
            // Rechts: Mittelpunkt <= rechter Rand - halbe Breite
            if (clampedX + halfW > boundingRect.x + boundingRect.width) {
                clampedX = boundingRect.x + boundingRect.width - halfW;
            }
            // Oben: Mittelpunkt >= oberer Rand + halbe Höhe
            if (clampedY - halfH < boundingRect.y) {
                clampedY = boundingRect.y + halfH;
            }
            // Unten: Mittelpunkt <= unterer Rand - halbe Höhe
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
                // steps,
                // currentStep,
                // setCurrentStep,
            });
        };

        return (
            // Wrap the Stage in a container with a fade-in transition.
            <div
                className="relative"
                style={{ touchAction: "none", opacity: isImagesLoaded ? 1 : 0, transition: "opacity 0.3s ease-in-out" }}
            >
                {/* Text Edit Overlay */}

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
                            // stroke="#ff0069"
                        />

                        {/* Multi-Graphic Render: */}
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
                                        scaleX={g.scale}
                                        scaleY={g.scale}
                                        width={g.width} // <- WICHTIG!
                                        height={g.height}
                                        rotation={g.rotation}
                                        draggable={isGraphicDraggable}
                                        offsetX={(g.width ?? 0) / 2}
                                        offsetY={(g.height ?? 0) / 2}
                                        onDragStart={handleGraphicDragStart}
                                        onDragEnd={(e) => handleGraphicDragEnd(e, g.id)}
                                        onTransform={handleGraphicTransform}
                                        onTransformEnd={(e) => handleGraphicTransformEnd(e, g.id)}
                                        dragBoundFunc={dragBoundFunc}
                                        // onMouseEnter={() => {
                                        //     setActiveElement(currentSide, "graphic", g.id); // <- wichtig für UI-Switch
                                        //     setTransformerVisible(true);
                                        // }}
                                        // onMouseLeave={() => {
                                        //     setTransformerVisible(false);
                                        // }}
                                        onMouseEnter={() => {
                                            hoveredRef.current = true;
                                            setTransformerVisible(true);
                                            transformerRef.current?.opacity(1);
                                        }}
                                        onMouseLeave={() => {
                                            hoveredRef.current = false;
                                            // kurzer Delay, damit man nicht flackert, wenn man knapp außerhalb fährt
                                            setTimeout(() => {
                                                if (!hoveredRef.current) {
                                                    new Konva.Tween({
                                                        node: transformerRef.current,
                                                        duration: 0.2,
                                                        opacity: 0,
                                                        onFinish: () => setTransformerVisible(false),
                                                    }).play();
                                                }
                                            }, 120);
                                        }}
                                        onClick={() => {
                                            setActiveElement(currentSide, "graphic", g.id);
                                            // sicherstellen, dass der Transformer auf genau diesem Node sitzt
                                            transformerRef.current?.nodes([graphicRefs.current[g.id].current]);
                                            transformerRef.current?.getLayer().batchDraw();
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

                        {/* Transformer ggf. hier auch ans aktive Bild hängen */}
                        {/* (Je nachdem, wie du das Handling machen willst) */}
                        {sideTexts.map((t) => {
                            if (!textRefs.current[t.id]) textRefs.current[t.id] = React.createRef();

                            // Breite schätzen (einmal pro Render ok)
                            const probe = new Konva.Text({
                                text: t.value || "",
                                fontSize: t.fontSize || 36,
                                fontFamily: t.fontFamily || "Roboto",
                            });
                            const extra = 1; // 15% länger
                            const textLength = Math.max(1, probe.width() * extra);

                            // Pfad mit Mittelpunkt (0,0) und stabiler Richtung
                            const pathD = centeredTextPath(textLength, t.curvature ?? 0);

                            return (
                                <Group
                                    key={t.id}
                                    ref={textRefs.current[t.id]}
                                    x={t.x}
                                    y={t.y}
                                    rotation={t.rotation || 0}
                                    scaleX={t.scale || 1}
                                    scaleY={t.scale || 1}
                                    draggable={isGraphicDraggable}
                                    dragBoundFunc={makeTextDragBound(textRefs.current[t.id])}
                                    // onMouseEnter={() => setActiveElement(currentSide, "text", t.id)}
                                    onMouseEnter={() => setHoveredTextId(t.id)} // nur Hover-Marker
                                    onMouseLeave={() => setHoveredTextId((id) => (id === t.id ? null : id))}
                                    onClick={() => setActiveElement(currentSide, "text", t.id)} // Aktivierung nur per Klick
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
                                >
                                    <KonvaTextPath
                                        data={pathD}
                                        text={t.value}
                                        fontSize={t.fontSize || 36}
                                        fontFamily={t.fontFamily || "Roboto"}
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
                                enabledAnchors={[]} // keine Resize-Handles
                                rotateEnabled={false} // kein Dreh-Handle
                                padding={6} // etwas Luft um den Text
                                // borderDash={[6, 4]} // gestrichelter Rahmen
                                borderStroke="#A42CD6" // deine Brand-Farbe
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
                                borderDash={[5, 4]} // gestrichelt = „nur Hover“
                                opacity={0.5}
                            />
                        )}
                    </Layer>
                </Stage>

                {/* Zoom & Reset UI */}
                <div className="top-8 left-0 flex-col" style={{ position: "absolute", display: "flex", gap: "10px" }}>
                    {/* <MobileSliders
                        containerWidth={containerWidth}
                        containerHeight={containerHeight}
                        zoomLevel={zoomLevel}
                        setZoomLevel={(val) => {
                            setZoomLevel(val);
                            if (stageRef.current) {
                                stageRef.current.scale({ x: val, y: val });
                                stageRef.current.batchDraw();
                            }
                        }}
                    /> */}
                    {!isMobile && (
                        <>
                            <Button
                                sx={{
                                    minWidth: "32px",
                                    padding: "8px",
                                    fontSize: "0.875rem",
                                }}
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
                                sx={{
                                    minWidth: "32px",
                                    padding: "8px",
                                    fontSize: "0.875rem",
                                }}
                                className="!bg-textColor"
                                onClick={() => {
                                    const newZoomLevel = Math.max(zoomLevel - 0.1, 1);
                                    setZoomLevel(newZoomLevel);
                                    stageRef.current.scale({ x: newZoomLevel, y: newZoomLevel });
                                    stageRef.current.batchDraw();
                                }}
                                variant="contained"
                                color="primary"
                                a
                            >
                                <FiZoomOut size={24} />
                            </Button>
                        </>
                    )}
                    <Button
                        sx={{
                            minWidth: "32px",
                            padding: "8px",
                            fontSize: "0.875rem",
                        }}
                        onClick={handleResetZoom}
                        variant="contained"
                        className="!bg-primaryColor-600"
                    >
                        <FiRefreshCw size={24} />
                    </Button>
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
                    <Button
                        sx={{ minWidth: "32px", padding: "8px", fontSize: "0.875rem" }}
                        className="!bg-primaryColor"
                        variant="contained"
                        // style={{ marginTop: "8px" }}
                        onClick={() => {
                            const defaultX = boundingRect.x + boundingRect.width / 2;
                            const defaultY = boundingRect.y + boundingRect.height / 2;

                            // Fügt Text hinzu *und* setzt activeElement = {type:'text', id}
                            addText(purchaseData.currentSide || "front", {
                                value: "Text hier bearbeiten",
                                x: defaultX,
                                y: defaultY,
                                fontSize: 36,
                                fontFamily: "Roboto",
                                fill: "#000",
                                rotation: 0,
                                scale: 1,
                            });

                            // OPTIONAL: Wenn du zusätzlich dein Inline-Overlay sofort öffnen willst:
                            // const side = (useStore.getState().purchaseData.sides || {})[purchaseData.currentSide || "front"];
                            // const id = side?.activeTextId;
                            // if (id) { setEditingTextId(id); setInputValue("Text hier bearbeiten"); }
                        }}
                    >
                        <FiType size={24} />
                    </Button>
                </div>
            </div>
        );
    }
);

KonvaLayer.displayName = "KonvaLayer";
export default KonvaLayer;
