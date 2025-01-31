import React, { useRef, useEffect, useState, forwardRef } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from "react-konva";
import useStore from "@/store/store";
import { Button } from "@mui/material";
import { FiZoomIn, FiZoomOut, FiRefreshCw } from "react-icons/fi";
import { exportCanvas } from "@/functions/exportCanvas";
import MobileSliders from "@/components/productConfigurator/mobile/mobileSliders";
import getImagePlacement from "@/functions/getImagePlacement";
import useIsMobile from "@/hooks/isMobile";

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
        const boundaryRectRef = useRef(null); // bounding rectangle reference

        const {
            purchaseData,
            setPurchaseData,
            setStageRef,
            setTransformerRef,
            // setBoundaryPathRef, etc. if needed
        } = useStore();

        const { containerWidth, containerHeight } = purchaseData;

        const [zoomLevel, setZoomLevel] = useState(1);
        const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
        const [isDraggingGraphic, setIsDraggingGraphic] = useState(false);
        const [isGraphicDraggable, setIsGraphicDraggable] = useState(purchaseData.configurator !== "template");
        const [showTransformer, setShowTransformer] = useState(purchaseData.configurator !== "template");

        const [isTemplate, setIsTemplate] = useState(purchaseData.configurator !== "template");

        // Simple hook returning boolean if mobile
        const isMobile = useIsMobile();

        useEffect(() => {
            setIsTemplate(purchaseData.configurator !== "template");
        }, [purchaseData.configurator]);

        // ---------------------------
        // Update config on load
        // ---------------------------
        useEffect(() => {
            setIsGraphicDraggable(purchaseData.configurator !== "template");
            setShowTransformer(purchaseData.configurator !== "template");

            // Clear transformer nodes if needed
            if (transformerRef.current && uploadedGraphicRef.current) {
                transformerRef.current.nodes([]);
                transformerRef.current.getLayer().batchDraw();
            }
            // If it’s a “template” mode, reset the stage zoom
            if (purchaseData.configurator === "template") {
                handleResetZoom();
            }
        }, [purchaseData.configurator]);

        // If Transformer is showing and we have an uploaded graphic
        useEffect(() => {
            if (uploadedGraphicRef.current && showTransformer) {
                transformerRef.current.nodes([uploadedGraphicRef.current]);
                transformerRef.current.getLayer().batchDraw();
            }
        }, [showTransformer]);

        // Save references in Zustand
        useEffect(() => {
            setStageRef(stageRef.current);
            setTransformerRef(transformerRef.current);

            return () => {
                setStageRef(null);
                setTransformerRef(null);
            };
        }, [setStageRef, setTransformerRef]);

        // ---------------------------
        // Load product image
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
            };
        }, [productImage, containerWidth, containerHeight]);

        // ---------------------------
        // Load uploaded graphic
        // ---------------------------
        useEffect(() => {
            if (!uploadedGraphicFile) return;

            console.log("UPLOADED GRAPHIC:", uploadedGraphicFile, uploadedGraphicURL);

            const currentSideData = purchaseData.sides?.[purchaseData.currentSide] || {};
            const isPDFSide = currentSideData.isPDF;
            const pdfPreviewURL = currentSideData.preview;

            // Helper to place the loaded image in the Konva canvas
            function placeAndDraw(loadedImg) {
                if (!uploadedGraphicRef.current) return;

                const { finalWidth, finalHeight } = getImagePlacement({
                    containerWidth,
                    containerHeight,
                    imageNaturalWidth: loadedImg.width,
                    imageNaturalHeight: loadedImg.height,
                });

                uploadedGraphicRef.current.width(finalWidth);
                uploadedGraphicRef.current.height(finalHeight);
                uploadedGraphicRef.current.offsetX(0);
                uploadedGraphicRef.current.offsetY(0);
                uploadedGraphicRef.current.image(loadedImg);
                uploadedGraphicRef.current.getLayer().batchDraw();

                // Attach the transformer
                if (transformerRef.current) {
                    transformerRef.current.nodes([uploadedGraphicRef.current]);
                    transformerRef.current.getLayer().batchDraw();
                }
            }

            if (isPDFSide && pdfPreviewURL) {
                const previewImg = new window.Image();
                previewImg.crossOrigin = "anonymous";
                previewImg.src = pdfPreviewURL;
                previewImg.onload = () => placeAndDraw(previewImg);
            } else {
                // normal image
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
            // Possibly reset zoom so export is always 1:1
            handleResetZoom();
            const dataURL = exportCanvas(stageRef, transformerRef, null, 1);
            console.log("Export dataURL:", dataURL);
            return dataURL;
        };

        useEffect(() => {
            if (onExportReady) {
                onExportReady(handleExport);
            }
        }, [onExportReady]);

        // ---------------------------
        // Drag / Scale logic for the graphic
        // ---------------------------
        const handleGraphicDragStart = () => {
            setIsDraggingGraphic(true);
        };

        const handleGraphicDragEnd = (e) => {
            setIsDraggingGraphic(false);
            if (isGraphicDraggable) {
                setPosition({ x: e.target.x(), y: e.target.y() });
            }
        };

        const handleGraphicTransformEnd = (e) => {
            if (isGraphicDraggable) {
                const newScale = Math.min(e.target.scaleX(), 3.5);
                console.log("end da sizer");
                setScale(newScale);
                e.target.scaleX(newScale);
                e.target.scaleY(newScale);
                e.target.getLayer().batchDraw();
            }
        };

        // ---------------
        // BOUNDING LOGIC
        // ---------------
        const dragBoundFunc = (pos) => {
            const boundingRectNode = boundaryRectRef.current;
            const shapeNode = uploadedGraphicRef.current;
            if (!boundingRectNode || !shapeNode) return pos;

            const boundingRect = boundingRectNode.getClientRect();
            const shapeRect = shapeNode.getClientRect();

            const newLeft = pos.x;
            const newTop = pos.y;
            const newRight = pos.x + shapeRect.width;
            const newBottom = pos.y + shapeRect.height;

            let clampedX = pos.x;
            let clampedY = pos.y;

            // Left clamp
            if (newLeft < boundingRect.x) {
                clampedX = boundingRect.x;
            }
            // Right clamp
            if (newRight > boundingRect.x + boundingRect.width) {
                clampedX = boundingRect.x + boundingRect.width - shapeRect.width;
            }
            // Top clamp
            if (newTop < boundingRect.y) {
                clampedY = boundingRect.y;
            }
            // Bottom clamp
            if (newBottom > boundingRect.y + boundingRect.height) {
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

        // ---------------
        // Reset Zoom
        // ---------------
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

        // If we switch sides (front/back), reset
        useEffect(() => {
            handleResetZoom();
        }, [purchaseData.currentSide]);

        // Example boundingRect
        const boundingRect = {
            x: containerWidth * 0.22,
            y: containerHeight * 0.15,
            width: containerWidth * 0.55,
            height: containerHeight * 0.76,
        };

        useEffect(() => {
            // Save boundingRect in purchaseData or do something with it
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

        // The key: disable Stage dragging on mobile. So single-finger swipes on mobile do not move stage.
        const stageIsDraggable = !isDraggingGraphic && !isMobile;

        return (
            <div style={{ touchAction: "none" }}>
                <Stage
                    ref={stageRef}
                    className="mix-blend-multiply"
                    width={containerWidth}
                    height={containerHeight}
                    scaleX={zoomLevel}
                    scaleY={zoomLevel}
                    x={stagePosition.x}
                    y={stagePosition.y}
                    draggable={stageIsDraggable} // <-- Off for mobile, on for desktop if not dragging the graphic
                    onMouseOver={() => stageRef.current && (stageRef.current.container().style.cursor = "grab")}
                    onMouseOut={() => stageRef.current && (stageRef.current.container().style.cursor = "default")}
                >
                    <Layer>
                        {/* Product Image (background) */}
                        {productImage && <KonvaImage ref={productImageRef} />}

                        {/* bounding box */}
                        <Rect
                            ref={boundaryRectRef}
                            x={boundingRect.x}
                            y={boundingRect.y}
                            width={boundingRect.width}
                            height={boundingRect.height}
                            // fill="rgba(0,255,0,0.1)"
                            // stroke="red"
                            // strokeWidth={2}
                        />

                        {/* Uploaded Graphic */}
                        {purchaseData.configurator !== "template" && (uploadedGraphicFile || uploadedGraphicURL) && (
                            <KonvaImage
                                ref={uploadedGraphicRef}
                                crossOrigin="anonymous"
                                draggable={isGraphicDraggable}
                                x={position.x}
                                y={position.y}
                                scaleX={scale}
                                scaleY={scale}
                                onDragStart={handleGraphicDragStart}
                                onDragEnd={handleGraphicDragEnd}
                                onTransformEnd={handleGraphicTransformEnd}
                                dragBoundFunc={dragBoundFunc}
                            />
                        )}

                        {/* Transformer */}
                        {purchaseData.configurator !== "template" &&
                            (uploadedGraphicFile || uploadedGraphicURL) &&
                            showTransformer && <Transformer ref={transformerRef} boundBoxFunc={boundBoxFunc} />}
                    </Layer>
                </Stage>

                {/* Zoom & Reset UI */}
                <div
                    className="top-16 right-10 flex-col"
                    style={{ position: "absolute", display: "flex", gap: "10px" }}
                >
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

                    {/* Desktop-only Zoom Buttons */}
                    {!isMobile && (
                        <>
                            <Button
                                className="!bg-textColor justify-center text-center !text-2xl"
                                onClick={() => {
                                    const newZoomLevel = Math.min(zoomLevel + 0.1, 3);
                                    setZoomLevel(newZoomLevel);
                                    stageRef.current.scale({ x: newZoomLevel, y: newZoomLevel });
                                    stageRef.current.batchDraw();
                                }}
                                variant="contained"
                                color="primary"
                            >
                                <FiZoomIn />
                            </Button>
                            <Button
                                className="!bg-textColor !text-2xl"
                                onClick={() => {
                                    const newZoomLevel = Math.max(zoomLevel - 0.1, 1);
                                    setZoomLevel(newZoomLevel);
                                    stageRef.current.scale({ x: newZoomLevel, y: newZoomLevel });
                                    stageRef.current.batchDraw();
                                }}
                                variant="contained"
                                color="primary"
                            >
                                <FiZoomOut />
                            </Button>
                        </>
                    )}
                    <Button onClick={handleResetZoom} className="!bg-primaryColor-600 !text-2xl" variant="contained">
                        <FiRefreshCw />
                    </Button>
                </div>
            </div>
        );
    }
);

KonvaLayer.displayName = "KonvaLayer";

export default KonvaLayer;
