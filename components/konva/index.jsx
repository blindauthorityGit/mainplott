import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import useStore from "@/store/store"; // Import Zustand store
import { Button } from "@mui/material"; // Importing a button from Material-UI for exporting the image
import { FiZoomIn, FiZoomOut } from "react-icons/fi"; // Importing zoom icons from react-icons

const KonvaLayer = ({
    productImage,
    uploadedGraphicFile,
    uploadedGraphicURL,
    boundaries,
    position,
    setPosition,
    scale,
    setScale,
    initialPosition,
}) => {
    // Create references for the Konva stage and layers
    const stageRef = useRef(null);
    const productImageRef = useRef(null);
    const uploadedGraphicRef = useRef(null);
    const transformerRef = useRef(null);

    // Zustand store to get container dimensions
    const { purchaseData } = useStore();
    const { containerWidth, containerHeight } = purchaseData;

    // State for canvas zoom level and position
    const [zoomLevel, setZoomLevel] = useState(1);
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
    const [isDraggingGraphic, setIsDraggingGraphic] = useState(false);

    // Log props to check their values
    useEffect(() => {
        console.log("Product Image: ", productImage);
        console.log("Uploaded Graphic File: ", uploadedGraphicFile);
        console.log("Uploaded Graphic URL: ", uploadedGraphicURL);
        console.log("Boundaries: ", boundaries);
        console.log("Position: ", position);
        console.log("Scale: ", scale);
        console.log("Initial Position: ", initialPosition);
    }, [productImage, uploadedGraphicFile, uploadedGraphicURL, boundaries, position, scale, initialPosition]);

    // Load the product image into the Konva image element
    useEffect(() => {
        if (productImage) {
            const img = new window.Image();
            // Set crossOrigin to anonymous
            img.src = productImage;
            img.onload = () => {
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

    // Load the uploaded graphic into the Konva image element
    useEffect(() => {
        if (uploadedGraphicFile || uploadedGraphicURL) {
            const img = new window.Image();
            // Set crossOrigin to anonymous
            if (uploadedGraphicURL) {
                img.src = uploadedGraphicURL;
                img.onload = () => {
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
                        transformerRef.current.nodes([uploadedGraphicRef.current]);
                        transformerRef.current.getLayer().batchDraw();
                    }
                };
            } else if (uploadedGraphicFile instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                    img.onload = () => {
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
                            transformerRef.current.nodes([uploadedGraphicRef.current]);
                            transformerRef.current.getLayer().batchDraw();
                        }
                    };
                };
                reader.readAsDataURL(uploadedGraphicFile);
            }
        }
    }, [uploadedGraphicFile, uploadedGraphicURL]);

    // Handle drag bounds based on the provided boundaries
    const handleDragBoundFunc = (pos) => {
        const { MIN_X, MAX_X, MIN_Y, MAX_Y } = boundaries;
        return {
            x: Math.max(MIN_X, Math.min(MAX_X, pos.x)),
            y: Math.max(MIN_Y, Math.min(MAX_Y, pos.y)),
        };
    };

    // Function to export the canvas as a JPEG
    const handleExport = () => {
        if (stageRef.current) {
            try {
                const dataURL = stageRef.current.toDataURL({ mimeType: "image/jpeg", quality: 1 });
                // Check if the dataURL is valid
                if (dataURL) {
                    const link = document.createElement("a");
                    link.download = "exported-design.jpg";
                    link.href = dataURL;
                    link.click();
                } else {
                    console.error("Failed to generate data URL.");
                }
            } catch (err) {
                console.error("Error exporting canvas: ", err);
            }
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

    return (
        <div>
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
                onDragEnd={handleStageDragEnd}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
            >
                <Layer>
                    {/* Product Image - background */}
                    {productImage && <KonvaImage ref={productImageRef} />}

                    {/* Uploaded Graphic - draggable and scalable */}
                    {(uploadedGraphicFile || uploadedGraphicURL) && (
                        <KonvaImage
                            ref={uploadedGraphicRef}
                            draggable
                            x={position.x}
                            y={position.y}
                            offsetX={60} // Set offset to scale from the center (half of the width)
                            offsetY={60} // Set offset to scale from the center (half of the height)
                            scaleX={scale}
                            scaleY={scale}
                            dragBoundFunc={handleDragBoundFunc}
                            onClick={() => {
                                console.log("Image clicked");
                                // Add logic to show icons or actions like delete/change
                            }}
                            onDragStart={() => setIsDraggingGraphic(true)}
                            onDragEnd={(e) => {
                                setPosition({ x: e.target.x(), y: e.target.y() });
                                setIsDraggingGraphic(false);
                            }}
                            onTransformEnd={(e) => {
                                // Scale is applied via transform, hence we update the state
                                const newScale = Math.min(e.target.scaleX(), 2.5); // Cap the scale at 2.5
                                setScale(newScale);
                                e.target.scaleX(newScale);
                                e.target.scaleY(newScale);
                                e.target.getLayer().batchDraw();
                            }}
                        />
                    )}
                    <Transformer
                        ref={transformerRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            // Limit resize to minimum and maximum size
                            if (newBox.width < 50 || newBox.height < 50 || newBox.width > 250 || newBox.height > 250) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                </Layer>
            </Stage>
            <div style={{ position: "absolute", bottom: 20, right: 20, display: "flex", gap: "10px" }}>
                <Button
                    className="!bg-primaryColor !text-2xl"
                    onClick={handleZoomIn}
                    variant="contained"
                    color="primary"
                >
                    <FiZoomIn />
                </Button>
                <Button
                    className="!bg-primaryColor !text-2xl"
                    onClick={handleZoomOut}
                    variant="contained"
                    color="primary"
                >
                    <FiZoomOut />
                </Button>
            </div>
            <Button variant="contained" color="primary" onClick={handleExport} style={{ marginTop: "20px" }}>
                Export as JPG
            </Button>
        </div>
    );
};

export default KonvaLayer;