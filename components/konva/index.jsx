import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer, Path as KonvaPath } from "react-konva";
import useStore from "@/store/store"; // Import Zustand store
import { Button } from "@mui/material"; // Importing a button from Material-UI for exporting the image
import { FiZoomIn, FiZoomOut, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";
import { exportCanvas } from "@/functions/exportCanvas"; // Adjust path as needed
import dynamic from "next/dynamic";
import MobileSliders from "@/components/productConfigurator/mobile/mobileSliders";

import dataURLToBlob from "@/functions/dataURLToBlob";

import { uploadImageToStorage } from "@/config/firebase";

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
        },
        ref
    ) => {
        // Create references for the Konva stage and layers
        const stageRef = useRef(null);
        const productImageRef = useRef(null);
        const uploadedGraphicRef = useRef(null);
        const transformerRef = useRef(null);
        const boundaryPathRef = useRef(null);

        // Zustand store to get container dimensions
        const {
            purchaseData,
            setPurchaseData,
            setSelectedImage,
            setConfiguredImage,
            setStageRef,
            setTransformerRef,
            setBoundaryPathRef,
        } = useStore();
        const { containerWidth, containerHeight } = purchaseData;

        // State for canvas zoom level and position
        const [zoomLevel, setZoomLevel] = useState(1);
        const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
        const [isDraggingGraphic, setIsDraggingGraphic] = useState(false);
        const [isGraphicDraggable, setIsGraphicDraggable] = useState(purchaseData.configurator !== "template");
        const [showTransformer, setShowTransformer] = useState(purchaseData.configurator !== "template");

        useEffect(() => {
            // Update draggability and transformer visibility when configurator changes
            setIsGraphicDraggable(purchaseData.configurator !== "template");
            setShowTransformer(purchaseData.configurator !== "template");
            console.log(purchaseData.configurator !== "template");
            // Reset transformer when switching modes
            if (transformerRef.current && uploadedGraphicRef.current) {
                transformerRef.current.nodes([]);
                transformerRef.current.getLayer().batchDraw();
            }
            if (purchaseData.configurator == "template") {
                handleResetZoom();
            }
        }, [purchaseData.configurator]);

        useEffect(() => {
            if (uploadedGraphicRef.current && showTransformer) {
                transformerRef.current.nodes([uploadedGraphicRef.current]);
                transformerRef.current.getLayer().batchDraw();
            }
        }, [showTransformer]);

        const [lastTouchDistance, setLastTouchDistance] = useState(null);

        // New states to track the loaded status of images
        const [isProductImageLoaded, setIsProductImageLoaded] = useState(false);
        const [isUploadedGraphicLoaded, setIsUploadedGraphicLoaded] = useState(false);

        useEffect(() => {
            // Save refs in Zustand
            setStageRef(stageRef.current);
            setTransformerRef(transformerRef.current);
            setBoundaryPathRef(boundaryPathRef.current);

            // Cleanup on unmount
            return () => {
                setStageRef(null);
                setTransformerRef(null);
                setBoundaryPathRef(null);
            };
        }, [setStageRef, setTransformerRef, setBoundaryPathRef]);

        // Load the product image into the Konva image element
        useEffect(() => {
            if (productImage) {
                const img = new window.Image();
                // Set crossOrigin to anonymous
                img.src = productImage;
                img.onload = () => {
                    setIsProductImageLoaded(true); // Update state when product image is loaded
                    img.crossOrigin = "Anonymous";

                    if (productImageRef.current) {
                        // Calculate aspect ratio and maintain "contain" logic
                        const aspectRatio = img.width / img.height;
                        let newWidth = containerWidth;
                        let newHeight = containerHeight;

                        if (aspectRatio > 1) {
                            // Landscape image
                            newWidth = Math.min(containerWidth, 860);
                            newHeight = newWidth / aspectRatio;
                        } else {
                            // Portrait or square image
                            newHeight = Math.min(containerHeight, 860);
                            newWidth = newHeight * aspectRatio;
                        }

                        // Center the image
                        const offsetX = (containerWidth - newWidth) / 2;
                        const offsetY = (containerHeight - newHeight) / 2;

                        productImageRef.current.width(newWidth);
                        productImageRef.current.height(newHeight);
                        productImageRef.current.x(offsetX);
                        productImageRef.current.y(offsetY);
                        productImageRef.current.image(img);

                        productImageRef.current.getLayer().batchDraw();
                    }
                };
            }
        }, [productImage, containerWidth, containerHeight]);

        useEffect(() => {
            console.log("KONVA LOADED");
            console.log(pdfPreview);
        }, []);

        // Load the uploaded graphic into the Konva image element, with placeholder logic for PDFs
        useEffect(() => {
            if (uploadedGraphicFile) {
                // Prioritize uploadedGraphicFile
                const img = new window.Image();
                console.log("Using uploadedGraphicFile:", uploadedGraphicFile);

                // Check if the file is a PDF (placeholder for custom PDF logic)
                if (uploadedGraphicFile.type === "application/pdf") {
                    console.log("PDF detected - applying custom logic here");

                    // Placeholder for PDF logic
                    // e.g., Loading from IndexedDB or handling transformed PNG
                    // Example:
                    // const pdfPreviewImage = await loadFromIndexedDB(...);
                    // img.src = pdfPreviewImage;
                } else {
                    // Logic for image files (JPG/PNG)
                    const reader = new FileReader();

                    reader.onload = (e) => {
                        img.src = e.target.result; // Load data URL from FileReader
                        img.onload = () => {
                            setIsUploadedGraphicLoaded(true); // Update state when image is loaded
                            console.log("IMAGE LOADED FROM FILE");

                            if (uploadedGraphicRef.current) {
                                const aspectRatio = img.width / img.height;
                                let newWidth = 120;
                                let newHeight = 120;

                                if (aspectRatio > 1) {
                                    newHeight = newWidth / aspectRatio;
                                } else {
                                    newWidth = newHeight * aspectRatio;
                                }

                                uploadedGraphicRef.current.width(newWidth);
                                uploadedGraphicRef.current.height(newHeight);
                                uploadedGraphicRef.current.image(img);
                                uploadedGraphicRef.current.getLayer().batchDraw();
                                transformerRef?.current?.nodes([uploadedGraphicRef.current]);
                                transformerRef?.current?.getLayer().batchDraw();
                            }
                        };
                    };

                    reader.readAsDataURL(uploadedGraphicFile); // Read the file as a Data URL
                }
            }
        }, [uploadedGraphicFile]); // Only depend on uploadedGraphicFile

        // Handle drag bounds based on the provided boundaries
        // Handle drag bounds based on the provided SVG path boundaries
        const handleDragBoundFunc = (pos) => {
            if (boundaryPathRef.current) {
                const rect = boundaryPathRef.current.getClientRect();
                const newX = Math.max(rect.x, Math.min(rect.x + rect.width, pos.x));
                const newY = Math.max(rect.y, Math.min(rect.y + rect.height, pos.y));
                console.log(rect);
                return {
                    x: newX,
                    y: newY,
                };
            }
            return pos;
        };

        // Calculate center position for the path
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;

        // Centering path on canvas
        useEffect(() => {
            if (boundaryPathRef.current) {
                boundaryPathRef.current.position({
                    x: 120,
                    y: 252,
                });

                // Set scale (example: scale down by half)
                boundaryPathRef.current.scale({ x: 1.22, y: 1.25 }); // Adjust scale values as needed

                boundaryPathRef.current.getLayer().batchDraw();
            }
        }, [centerX, centerY]);

        // Function to export the canvas as a JPEG
        const handleExport = async () => {
            const dataURL = exportCanvas(stageRef, transformerRef, boundaryPathRef, 1);

            // Save the exported dataURL directly into session storage
            sessionStorage.setItem("exportedProductImage", dataURL);

            // Retrieve the saved session storage dataURL
            const sessionImageURL = sessionStorage.getItem("exportedProductImage");

            // Update Zustand state with the session-stored image URL
            setConfiguredImage(sessionImageURL);

            console.log("Exported image saved to sessionStorage:", sessionImageURL);

            const blob = dataURLToBlob(dataURL);
            const fileName = `product-image-${Date.now()}.png`;
            try {
                const downloadURL = await uploadImageToStorage(blob, fileName);
                // Update your product data with the new image URL
                console.log("DA URL", downloadURL);
                // setSelectedImage(downloadURL);
                setPurchaseData({
                    ...purchaseData,
                    configImage: downloadURL,
                });
            } catch (error) {
                console.error("Error saving configured design:", error);
            }
        };

        useEffect(() => {
            if (onExportReady) {
                onExportReady(handleExport);
            }
        }, [onExportReady]);

        const handleGraphicDragEnd = (e) => {
            if (isGraphicDraggable) {
                setPosition({ x: e.target.x(), y: e.target.y() });
            }
        };

        const handleGraphicTransformEnd = (e) => {
            if (isGraphicDraggable) {
                const newScale = Math.min(e.target.scaleX(), 2.5);
                setScale(newScale);
                e.target.scaleX(newScale);
                e.target.scaleY(newScale);
                e.target.getLayer().batchDraw();
            }
        };

        // Function to handle zoom change
        const handleZoomIn = () => {
            const newZoomLevel = Math.min(zoomLevel + 0.1, 3);
            setZoomLevel(newZoomLevel);
            if (stageRef.current) {
                stageRef.current.scale({ x: newZoomLevel, y: newZoomLevel });
                stageRef.current.batchDraw();
            }
        };

        const handleZoomOut = () => {
            const newZoomLevel = Math.max(zoomLevel - 0.1, 1);
            setZoomLevel(newZoomLevel);
            if (stageRef.current) {
                stageRef.current.scale({ x: newZoomLevel, y: newZoomLevel });
                stageRef.current.batchDraw();
            }
        };

        // Function to handle dragging of the whole stage
        const handleStageDragEnd = (e) => {
            if (!isDraggingGraphic) {
                setStagePosition({ x: e.target.x(), y: e.target.y() });
            }
        };

        const handleMouseOver = () => {
            if (stageRef.current) {
                stageRef.current.container().style.cursor = "grab";
            }
        };

        const handleMouseOut = () => {
            if (stageRef.current) {
                stageRef.current.container().style.cursor = "default";
            }
        };

        const handleZoomChange = (newZoom) => {
            setZoomLevel(newZoom);
            if (stageRef.current) {
                stageRef.current.scale({ x: newZoom, y: newZoom });
                stageRef.current.batchDraw();
            }
        };

        // Pinch-to-Zoom Logic
        // Pinch Zoom Functions
        const handleTouchStart = (e) => {
            if (e.touches.length === 2) {
                const [touch1, touch2] = e.touches;
                const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
                setLastTouchDistance(distance);
            }
        };

        const handleTouchMove = (e) => {
            if (e.touches.length === 2) {
                const [touch1, touch2] = e.touches;
                const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

                if (lastTouchDistance) {
                    const scaleDelta = (distance - lastTouchDistance) * 0.002; // Slower zoom
                    const newZoomLevel = Math.max(1, Math.min(zoomLevel + scaleDelta, 3));

                    if (stageRef.current) {
                        const stage = stageRef.current;
                        const scaleFactor = newZoomLevel / zoomLevel;

                        const center = {
                            x: (touch1.clientX + touch2.clientX) / 2,
                            y: (touch1.clientY + touch2.clientY) / 2,
                        };

                        const newPos = {
                            x: center.x - scaleFactor * (center.x - stage.x()),
                            y: center.y - scaleFactor * (center.y - stage.y()),
                        };

                        stage.scale({ x: newZoomLevel, y: newZoomLevel });
                        stage.position(newPos);
                        stage.batchDraw();

                        setStagePosition(newPos);
                        setZoomLevel(newZoomLevel);
                    }
                }
                setLastTouchDistance(distance);
            }
        };

        const handleTouchEnd = () => {
            setLastTouchDistance(null);
        };

        // Reset Zoom and Position
        const handleResetZoom = () => {
            setZoomLevel(1);
            setStagePosition({ x: 0, y: 0 });
            stageRef.current.scale({ x: 1, y: 1 });
            stageRef.current.position({ x: 0, y: 0 });
            stageRef.current.batchDraw();
        };

        // Prevent dragging at minimum zoom level
        const isDraggable = true;

        return (
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: "none" }}
            >
                <Stage
                    ref={stageRef}
                    className="mix-blend-multiply"
                    width={containerWidth}
                    height={containerHeight}
                    scaleX={zoomLevel}
                    scaleY={zoomLevel}
                    draggable={isDraggable}
                    x={stagePosition.x}
                    y={stagePosition.y}
                    onDragEnd={handleStageDragEnd}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                >
                    <Layer>
                        {/* Product Image - background */}
                        {productImage && <KonvaImage ref={productImageRef} />}
                        {/* Boundary Path - visible for development purposes */}
                        {/* <KonvaPath
                            ref={boundaryPathRef}
                            data={
                                "M40.4915 305.5C40.4915 205.5 13.8248 101.167 0.491516 61.5C-6.16229 39.5001 56.3858 11.3334 88.4915 0C93.3249 9.83333 116.392 30.3 169.992 33.5C236.992 37.5 249.492 3.50004 250.492 4.50004C302.992 3.00004 341.992 61.5 340.992 61.5C302.992 74.3 290.492 187.167 288.992 242V432C288.992 456.8 267.325 460.667 256.492 459.5C205.158 459.167 96.4915 458.7 72.4915 459.5C42.4915 460.5 40.4915 430.5 40.4915 305.5Z" // Sample rectangular path for testing
                            }
                            stroke="red"
                            strokeWidth={2}
                            dash={[10, 5]} // Makes the path visible with dashed lines
                            opacity={0.5} // Reduce opacity to avoid too much distraction
                        /> */}
                        {/* Uploaded Graphic - draggable and scalable */}
                        {(uploadedGraphicFile || uploadedGraphicURL) && (
                            <KonvaImage
                                ref={uploadedGraphicRef}
                                draggable={isGraphicDraggable} // Disable dragging in template mode
                                x={position.x}
                                y={position.y}
                                offsetX={60} // Set offset to scale from the center (half of the width)
                                offsetY={60} // Set offset to scale from the center (half of the height)
                                scaleX={scale}
                                scaleY={scale}
                                // dragBoundFunc={handleDragBoundFunc}
                                onClick={() => {
                                    console.log("Image clicked");
                                }}
                                onDragStart={() => {
                                    if (purchaseData.configurator !== "template") {
                                        setIsDraggingGraphic(true);
                                    }
                                }}
                                onDragEnd={handleGraphicDragEnd}
                                onTransformEnd={handleGraphicTransformEnd}
                            />
                        )}
                        {/* Transformer - Only apply if a graphic is present */}
                        {(uploadedGraphicFile || uploadedGraphicURL) && showTransformer && (
                            <Transformer
                                ref={transformerRef}
                                boundBoxFunc={(oldBox, newBox) => {
                                    // Limit resize to minimum and maximum size
                                    if (
                                        newBox.width < 50 ||
                                        newBox.height < 50 ||
                                        newBox.width > 300 ||
                                        newBox.height > 300
                                    ) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                            />
                        )}
                    </Layer>
                </Stage>
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
                        className="!bg-textColor !text-2xl !hidden lg:!block"
                        onClick={handleZoomIn}
                        variant="contained"
                        color="primary"
                    >
                        <FiZoomIn />
                    </Button>
                    <Button
                        className="!bg-textColor !text-2xl !hidden lg:!block"
                        onClick={handleZoomOut}
                        variant="contained"
                        color="primary"
                    >
                        <FiZoomOut />
                    </Button>
                    <Button onClick={handleResetZoom} className=" !hidden lg:!block" variant="contained">
                        <FiRefreshCw />
                    </Button>
                </div>
                {/* <Button variant="contained" color="primary" onClick={handleExport} style={{ marginTop: "20px" }}>
                    Export as JPG
                </Button> */}
            </div>
        );
    }
);

KonvaLayer.displayName = "KonvaLayer"; // Add this line

export default KonvaLayer;

// Wrapper for dynamic import with forwardRef
// export const DynamicKonvaLayer = dynamic(() => Promise.resolve(KonvaLayer), { ssr: false });
