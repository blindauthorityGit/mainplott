import React, { useRef, useEffect, useState, forwardRef } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Text } from "react-konva";
import useStore from "@/store/store";
import { Button } from "@mui/material";
import { FiZoomIn, FiZoomOut, FiRefreshCw } from "react-icons/fi";
import { exportCanvas } from "@/functions/exportCanvas";
import MobileSliders from "@/components/productConfigurator/mobile/mobileSliders";
import getImagePlacement, { getFixedImagePlacement } from "@/functions/getImagePlacement";
import useIsMobile from "@/hooks/isMobile";
import Konva from "konva";

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

        const { purchaseData, setPurchaseData, setStageRef, setTransformerRef } = useStore();
        const { containerWidth, containerHeight } = purchaseData;

        // NEW: Track when the images have loaded
        const [productImageLoaded, setProductImageLoaded] = useState(false);
        const [graphicLoaded, setGraphicLoaded] = useState(false);

        // Compute overall loaded state:
        const isImagesLoaded = productImageLoaded && (!uploadedGraphicFile || graphicLoaded);

        const [zoomLevel, setZoomLevel] = useState(1);
        const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
        const [isDraggingGraphic, setIsDraggingGraphic] = useState(false);
        const [isGraphicDraggable, setIsGraphicDraggable] = useState(purchaseData.configurator !== "template");

        const [transformerVisible, setTransformerVisible] = useState(false);
        const [isTemplate, setIsTemplate] = useState(purchaseData.configurator !== "template");

        // --- Hover state for the edit area ---
        const [isEditAreaHovered, setIsEditAreaHovered] = useState(false);
        const fadeOutTimeoutRef = useRef(null);
        const hoveredRef = useRef(false);

        useEffect(() => {
            hoveredRef.current = isEditAreaHovered;
        }, [isEditAreaHovered]);

        const isMobile = useIsMobile();

        useEffect(() => {
            setIsTemplate(purchaseData.configurator !== "template");
        }, [purchaseData.configurator]);

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
        let boundingRect;

        console.log("KONFIG BOX:", purchaseData?.product?.konfigBox);

        if (purchaseData?.product?.konfigBox && purchaseData?.product?.konfigBox?.value) {
            try {
                // Parse the JSON from konfigBox. Expected format: {"width": 1, "height": 0.128}
                const konfig = JSON.parse(purchaseData.product.konfigBox.value);
                // Multiply the parsed relative values by container dimensions.
                const width = konfig.width * containerWidth;
                const height = konfig.height * containerHeight;

                // Center the bounding box. (Alternatively, you can calculate x and y differently if needed.)
                const x = konfig?.x ? konfig.x * containerWidth : (containerWidth - width) / 2;

                // const y = (containerHeight - height) / 2;
                // Use konfig.y if defined, otherwise center vertically:
                const y = konfig.y !== undefined ? konfig.y * containerHeight : (containerHeight - height) / 2;
                boundingRect = { x, y, width, height };
                console.log(boundingRect);

                setPurchaseData((prev) => ({
                    ...prev,
                    boundingRect: { x, y, width, height },
                }));
            } catch (error) {
                console.error("Error parsing konfigBox JSON:", error);
                // Fallback to the default values if parsing fails.
                boundingRect = {
                    x: containerWidth * 0.22,
                    y: containerHeight * 0.15,
                    width: containerWidth * 0.55,
                    height: containerHeight * 0.76,
                };

                setPurchaseData((prev) => ({
                    ...prev,
                    boundingRect: {
                        x: containerWidth * 0.22,
                        y: containerHeight * 0.15,
                        width: containerWidth * 0.55,
                        height: containerHeight * 0.76,
                    },
                }));
            }
        } else {
            // If there's no konfigBox provided, use the default values.
            boundingRect = {
                x: containerWidth * 0.22,
                y: containerHeight * 0.15,
                width: containerWidth * 0.55,
                height: containerHeight * 0.76,
            };

            setPurchaseData((prev) => ({
                ...prev,
                boundingRect: {
                    x: containerWidth * 0.22,
                    y: containerHeight * 0.15,
                    width: containerWidth * 0.55,
                    height: containerHeight * 0.76,
                },
            }));
        }

        console.log(boundingRect);

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

                // Apply the placement values to your graphic:
                uploadedGraphicRef.current.width(placement.finalWidth);
                uploadedGraphicRef.current.height(placement.finalHeight);
                if (purchaseData.product.konfigBox && purchaseData.product.konfigBox.value) {
                    uploadedGraphicRef.current.x(placement.x);
                    uploadedGraphicRef.current.y(placement.y);
                }
                // Optionally, set offsets for rotation:
                uploadedGraphicRef.current.offsetX(0);
                uploadedGraphicRef.current.offsetY(0);
                // uploadedGraphicRef.current.offsetX(placement.finalWidth / 2);
                // uploadedGraphicRef.current.offsetY(placement.finalHeight / 2);
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
            const dataURL = exportCanvas(stageRef, transformerRef, null, 1);

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

        const handleGraphicDragEnd = (e) => {
            setIsDraggingGraphic(false);
            if (isGraphicDraggable) {
                setPosition({ x: e.target.x(), y: e.target.y() }, e.target.rotation());
            }
        };

        // Update parent's scale continuously so slider stays in sync
        const handleGraphicTransform = (e) => {
            if (isGraphicDraggable) {
                const currentScale = e.target.scaleX(); // assuming uniform scale
                setScale(currentScale);
            }
        };

        const handleGraphicTransformEnd = (e) => {
            if (isGraphicDraggable) {
                const newScale = Math.min(e.target.scaleX(), 5.5);
                setScale(newScale);
                e.target.scaleX(newScale);
                e.target.scaleY(newScale);
                const newRotation = e.target.rotation();
                setPosition({ x: e.target.x(), y: e.target.y() }, newRotation);
                e.target.getLayer().batchDraw();
            }
        };

        // ---------------------------
        // BOUNDING LOGIC
        // ---------------------------
        const dragBoundFunc = (pos) => {
            const boundingRectNode = boundaryRectRef.current;
            const shapeNode = uploadedGraphicRef.current;
            if (!boundingRectNode || !shapeNode) return pos;
            const boundingRect = boundingRectNode.getClientRect();
            const shapeRect = shapeNode.getClientRect();
            let clampedX = pos.x;
            let clampedY = pos.y;
            if (pos.x < boundingRect.x) {
                clampedX = boundingRect.x;
            }
            if (pos.x + shapeRect.width > boundingRect.x + boundingRect.width) {
                clampedX = boundingRect.x + boundingRect.width - shapeRect.width;
            }
            if (pos.y < boundingRect.y) {
                clampedY = boundingRect.y;
            }
            if (pos.y + shapeRect.height > boundingRect.y + boundingRect.height) {
                clampedY = boundingRect.y + boundingRect.height - shapeRect.height;
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

        return (
            // Wrap the Stage in a container with a fade-in transition.
            <div
                style={{ touchAction: "none", opacity: isImagesLoaded ? 1 : 0, transition: "opacity 0.3s ease-in-out" }}
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
                            x={boundingRect.x}
                            y={boundingRect.y}
                            width={boundingRect.width}
                            height={boundingRect.height}
                            // stroke="#ff0069"
                        />
                        {purchaseData.configurator !== "template" && (uploadedGraphicFile || uploadedGraphicURL) && (
                            <KonvaImage
                                ref={uploadedGraphicRef}
                                key={purchaseData.currentSide}
                                crossOrigin="anonymous"
                                draggable={isGraphicDraggable}
                                x={position.x}
                                y={position.y}
                                scaleX={scale}
                                scaleY={scale}
                                rotation={position.rotation || 0}
                                onDragStart={handleGraphicDragStart}
                                onDragEnd={handleGraphicDragEnd}
                                onTransform={handleGraphicTransform}
                                onTransformEnd={handleGraphicTransformEnd}
                                dragBoundFunc={dragBoundFunc}
                                onMouseEnter={handleEditAreaMouseEnter}
                                onMouseLeave={handleEditAreaMouseLeave}
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
                        )}
                        {purchaseData.configurator !== "template" &&
                            (uploadedGraphicFile || uploadedGraphicURL) &&
                            transformerVisible && (
                                <Transformer
                                    ref={transformerRef}
                                    boundBoxFunc={boundBoxFunc}
                                    onMouseEnter={handleEditAreaMouseEnter}
                                    onMouseLeave={handleEditAreaMouseLeave}
                                    borderStroke="#FFFFFF"
                                    anchorStroke="#A42CD6"
                                    anchorFill="#A42CD6"
                                />
                            )}
                    </Layer>
                </Stage>
                {/* Zoom & Reset UI */}
                <div className="top-8 left-0 flex-col" style={{ position: "absolute", display: "flex", gap: "10px" }}>
                    <MobileSliders
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
                    />
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
                                <FiZoomIn size={16} />
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
                                <FiZoomOut size={16} />
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
                        <FiRefreshCw size={16} />
                    </Button>
                </div>
            </div>
        );
    }
);

KonvaLayer.displayName = "KonvaLayer";
export default KonvaLayer;
