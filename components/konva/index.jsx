import React, { useRef, useEffect, useState, forwardRef } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from "react-konva";
import useStore from "@/store/store";
import { Button } from "@mui/material";
import { FiZoomIn, FiZoomOut, FiRefreshCw } from "react-icons/fi";
import { exportCanvas } from "@/functions/exportCanvas";
import dataURLToBlob from "@/functions/dataURLToBlob";
import { uploadImageToStorage } from "@/config/firebase";
import MobileSliders from "@/components/productConfigurator/mobile/mobileSliders";
import getImagePlacement from "@/functions/getImagePlacement";

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
        const boundaryRectRef = useRef(null); // <--- bounding rectangle

        const {
            purchaseData,
            setPurchaseData,
            setConfiguredImage,
            setStageRef,
            setTransformerRef,
            // We won't use setBoundaryPathRef in this example, but it's in your code
        } = useStore();
        const { containerWidth, containerHeight } = purchaseData;

        const [zoomLevel, setZoomLevel] = useState(1);
        const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
        const [isDraggingGraphic, setIsDraggingGraphic] = useState(false);
        const [isGraphicDraggable, setIsGraphicDraggable] = useState(purchaseData.configurator !== "template");
        const [showTransformer, setShowTransformer] = useState(purchaseData.configurator !== "template");

        const [isTemplate, setIsTemplate] = useState(purchaseData.configurator !== "template");

        useEffect(() => {
            setIsTemplate(purchaseData.configurator !== "template");
        }, [purchaseData.configurator]);

        // ---------------------------
        // Update config on load
        // ---------------------------
        useEffect(() => {
            setIsGraphicDraggable(purchaseData.configurator !== "template");
            setShowTransformer(purchaseData.configurator !== "template");
            if (transformerRef.current && uploadedGraphicRef.current) {
                transformerRef.current.nodes([]);
                transformerRef.current.getLayer().batchDraw();
            }
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
            // Omit setBoundaryPathRef(...) for clarity

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
                // Fit image "contain" inside containerWidth x containerHeight
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
            // If there's no uploaded file at all, we skip.
            if (!uploadedGraphicFile) return;

            console.log("UPLOADED GRAPHIC:", uploadedGraphicFile, uploadedGraphicURL);

            const currentSideData = purchaseData.sides?.[purchaseData.currentSide] || {};
            const isPDFSide = currentSideData.isPDF;
            const pdfPreviewURL = currentSideData.preview;

            // Helper to place the loaded image in the Konva canvas
            function placeAndDraw(loadedImg) {
                if (!uploadedGraphicRef.current) return;

                const { x, y, offsetX, offsetY, finalWidth, finalHeight } = getImagePlacement({
                    containerWidth,
                    containerHeight,
                    imageNaturalWidth: loadedImg.width,
                    imageNaturalHeight: loadedImg.height,
                });

                uploadedGraphicRef.current.width(finalWidth);
                uploadedGraphicRef.current.height(finalHeight);
                // If you want to set an initial position or offsets, do so here
                // uploadedGraphicRef.current.x(x);
                // uploadedGraphicRef.current.y(y);
                uploadedGraphicRef.current.offsetX(0);
                uploadedGraphicRef.current.offsetY(0);
                uploadedGraphicRef.current.image(loadedImg);
                uploadedGraphicRef.current.getLayer().batchDraw();

                // If we have a transformer, attach it to the uploaded image
                if (transformerRef.current) {
                    transformerRef.current.nodes([uploadedGraphicRef.current]);
                    transformerRef.current.getLayer().batchDraw();
                }
            }

            // 1) If it's a PDF side, we load pdfPreview URL instead of reading the file
            if (isPDFSide && pdfPreviewURL) {
                const previewImg = new window.Image();
                previewImg.src = pdfPreviewURL;
                previewImg.onload = () => {
                    placeAndDraw(previewImg);
                };
            } else {
                // 2) Otherwise, treat it like a normal image (JPG/PNG)
                const reader = new FileReader();
                reader.onload = (e) => {
                    const normalImg = new window.Image();
                    normalImg.src = e.target.result;
                    normalImg.onload = () => {
                        placeAndDraw(normalImg);
                    };
                };
                reader.readAsDataURL(uploadedGraphicFile);
            }
        }, [uploadedGraphicFile, uploadedGraphicURL, containerWidth, containerHeight, purchaseData.currentSide]);

        // ---------------------------
        // Export logic
        // ---------------------------
        const handleExport = () => {
            handleResetZoom();
            const dataURL = exportCanvas(stageRef, transformerRef, null, 1); // pass null for boundaryPathRef
            console.log("Export dataURL:", dataURL);
            return dataURL;
        };

        useEffect(() => {
            if (onExportReady) {
                onExportReady(handleExport);
            }
        }, [onExportReady]);

        // ---------------------------
        // Drag / Scale logic
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
        // This dragBoundFunc will clamp the graphic's position so it can't leave the boundaryRectRef.
        const dragBoundFunc = (pos) => {
            const boundingRectNode = boundaryRectRef.current;
            const shapeNode = uploadedGraphicRef.current;
            if (!boundingRectNode || !shapeNode) return pos;

            // The bounding rectangle’s absolute position on the Stage:
            const boundingRect = boundingRectNode.getClientRect();

            // shapeRect is the shape’s current bounding box
            // *before* we move it to pos.x/pos.y.
            // Konva calls dragBoundFunc to see if new pos is allowed.
            const shapeRect = shapeNode.getClientRect();

            // We want the shape’s top-left corner to move to pos.x / pos.y
            // So the “newLeft” & “newTop” become pos.x / pos.y
            // Then “newRight” & “newBottom” are pos.x + shapeRect.width, pos.y + shapeRect.height
            // (assuming no offset or anchor shift).
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

        // This boundBoxFunc will clamp the scale so that the graphic never grows beyond the boundary rect.
        const boundBoxFunc = (oldBox, newBox) => {
            const boundingRectNode = boundaryRectRef.current;
            if (!boundingRectNode || !uploadedGraphicRef.current) return newBox;

            const boundingRect = boundingRectNode.getClientRect();

            // newBox is the prospective new bounding box after transform
            // We'll do a simple check: if newBox goes outside boundingRect, revert
            // More advanced logic might clamp scale partially, but let's revert for simplicity:

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
            stageRef.current.scale({ x: 1, y: 1 });
            stageRef.current.position({ x: 0, y: 0 });
            stageRef.current.batchDraw();
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

        // For example, read from product or purchaseData to compute boundingRect
        // Maybe you store these fractions in each product, so e.g. product.boundingBox = { x: 0.2, y: 0.1, width: 0.6, height: 0.7 }
        // Or you hardcode them for demonstration:
        const boundingRect = {
            x: containerWidth * 0.22,
            y: containerHeight * 0.15,
            width: containerWidth * 0.55,
            height: containerHeight * 0.76,
        };

        useEffect(() => {
            // Save boundingRect in purchaseData
            setPurchaseData((prev) => ({
                ...prev,
                boundingRect, // store x,y,width,height in global state
            }));
        }, [containerWidth, containerHeight /* also product changes if any*/]);

        useEffect(() => {
            if (stageRef.current) {
                // Force Konva to re-draw the stage
                stageRef.current.batchDraw();
            }
        }, [purchaseData.configurator]);

        return (
            <div style={{ touchAction: "none" }}>
                <Stage
                    ref={stageRef}
                    className="mix-blend-multiply"
                    width={containerWidth}
                    height={containerHeight}
                    scaleX={zoomLevel}
                    scaleY={zoomLevel}
                    draggable={!isDraggingGraphic}
                    x={stagePosition.x}
                    y={stagePosition.y}
                    onMouseOver={() => stageRef.current && (stageRef.current.container().style.cursor = "grab")}
                    onMouseOut={() => stageRef.current && (stageRef.current.container().style.cursor = "default")}
                >
                    <Layer>
                        {/* Product Image (behind everything) */}
                        {productImage && <KonvaImage ref={productImageRef} />}

                        {/* 
              Our boundingRect above the product image but behind the graphic.
              Let's center it at (containerWidth*0.5, containerHeight*0.5)
              We'll pick some arbitrary width & height for demonstration.
            */}
                        <Rect
                            ref={boundaryRectRef} // <-- add this!
                            x={boundingRect.x}
                            y={boundingRect.y}
                            width={boundingRect.width}
                            height={boundingRect.height}
                            // fill="rgba(0, 255, 0, 0.1)"
                            // stroke="green"
                            // strokeWidth={2}
                        />

                        {/* Uploaded Graphic */}
                        {purchaseData.configurator !== "template" && (uploadedGraphicFile || uploadedGraphicURL) && (
                            <KonvaImage
                                // key={purchaseData.configurator} // triggers a remount on mode change
                                ref={uploadedGraphicRef}
                                draggable={isGraphicDraggable}
                                x={position.x}
                                y={position.y}
                                scaleX={scale}
                                scaleY={scale}
                                onDragStart={handleGraphicDragStart}
                                onDragEnd={handleGraphicDragEnd}
                                onTransformEnd={handleGraphicTransformEnd}
                                dragBoundFunc={dragBoundFunc} // <--- bounding logic for drag
                            />
                        )}

                        {/* Transformer with a scale bounding function */}
                        {purchaseData.configurator !== "template" &&
                            (uploadedGraphicFile || uploadedGraphicURL) &&
                            showTransformer && (
                                <Transformer
                                    ref={transformerRef}
                                    boundBoxFunc={boundBoxFunc} // <--- bounding logic for scale
                                />
                            )}
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
                        setZoomLevel={setZoomLevel}
                    />
                    <Button
                        className="!bg-textColor justify-center text-center !text-2xl !hidden lg:!block"
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
                        className="!bg-textColor !text-2xl !hidden lg:!block"
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
                    <Button
                        onClick={handleResetZoom}
                        className="!bg-primaryColor-600 !text-2xl !hidden lg:!block"
                        variant="contained"
                    >
                        <FiRefreshCw />
                    </Button>
                </div>
            </div>
        );
    }
);

KonvaLayer.displayName = "KonvaLayer";

export default KonvaLayer;
