import React, { useRef, useEffect, useState, forwardRef } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
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
        const boundaryPathRef = useRef(null);

        const {
            purchaseData,
            setPurchaseData,
            setConfiguredImage,
            setStageRef,
            setTransformerRef,
            setBoundaryPathRef,
        } = useStore();
        const { containerWidth, containerHeight } = purchaseData;

        const [zoomLevel, setZoomLevel] = useState(1);
        const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
        const [isDraggingGraphic, setIsDraggingGraphic] = useState(false);
        const [isGraphicDraggable, setIsGraphicDraggable] = useState(purchaseData.configurator !== "template");
        const [showTransformer, setShowTransformer] = useState(purchaseData.configurator !== "template");

        useEffect(() => {
            // Update draggability and transformer visibility when configurator changes
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

        useEffect(() => {
            if (uploadedGraphicRef.current && showTransformer) {
                transformerRef.current.nodes([uploadedGraphicRef.current]);
                transformerRef.current.getLayer().batchDraw();
            }
        }, [showTransformer]);

        useEffect(() => {
            // Save refs in Zustand
            setStageRef(stageRef.current);
            setTransformerRef(transformerRef.current);
            setBoundaryPathRef(boundaryPathRef.current);

            return () => {
                setStageRef(null);
                setTransformerRef(null);
                setBoundaryPathRef(null);
            };
        }, [setStageRef, setTransformerRef, setBoundaryPathRef]);

        // Load the product image
        useEffect(() => {
            if (productImage) {
                const img = new window.Image();
                img.crossOrigin = "Anonymous";
                img.src = productImage;
                img.onload = () => {
                    if (productImageRef.current) {
                        const aspectRatio = img.width / img.height;
                        let newWidth = containerWidth;
                        let newHeight = containerHeight;

                        if (aspectRatio > 1) {
                            newWidth = Math.min(containerWidth, 860);
                            newHeight = newWidth / aspectRatio;
                        } else {
                            newHeight = Math.min(containerHeight, 860);
                            newWidth = newHeight * aspectRatio;
                        }

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

        // Load the uploaded graphic and use getImagePlacement
        useEffect(() => {
            if (uploadedGraphicFile) {
                console.log("THIS ONE GETS CALLED", purchaseData.sides.front);
                const img = new window.Image();
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                    img.onload = () => {
                        if (uploadedGraphicRef.current) {
                            const { x, y, offsetX, offsetY, finalWidth, finalHeight } = getImagePlacement({
                                containerWidth,
                                containerHeight,
                                imageNaturalWidth: img.width,
                                imageNaturalHeight: img.height,
                            });

                            uploadedGraphicRef.current.width(finalWidth);
                            uploadedGraphicRef.current.height(finalHeight);
                            uploadedGraphicRef.current.x(x);
                            uploadedGraphicRef.current.y(y);
                            uploadedGraphicRef.current.offsetX(offsetX);
                            uploadedGraphicRef.current.offsetY(offsetY);
                            uploadedGraphicRef.current.image(img);
                            uploadedGraphicRef.current.getLayer().batchDraw();

                            console.log(x, y, offsetX, offsetY, finalWidth, finalHeight);

                            if (transformerRef.current) {
                                transformerRef.current.nodes([uploadedGraphicRef.current]);
                                transformerRef.current.getLayer().batchDraw();
                            }
                        }
                    };
                };
                reader.readAsDataURL(uploadedGraphicFile);
            }
        }, [uploadedGraphicFile]);

        // const handleExport = async () => {
        //     handleResetZoom();
        //     console.log("GETTING EXPORETED");
        //     const dataURL = exportCanvas(stageRef, transformerRef, boundaryPathRef, 1);
        //     sessionStorage.setItem("exportedProductImage", dataURL);
        //     const sessionImageURL = sessionStorage.getItem("exportedProductImage");
        //     setConfiguredImage(sessionImageURL);

        //     const blob = dataURLToBlob(dataURL);
        //     const fileName = `product-image-${Date.now()}.png`;
        //     try {
        //         const downloadURL = await uploadImageToStorage(blob, fileName);
        //         setPurchaseData((prev) => ({
        //             ...prev,
        //             configImage: downloadURL,
        //         }));
        //     } catch (error) {
        //         console.error("Error saving configured design:", error);
        //     }
        // };
        const handleExport = () => {
            // Reset zoom if needed
            handleResetZoom();
            // Export current canvas state to dataURL
            const dataURL = exportCanvas(stageRef, transformerRef, boundaryPathRef, 1);
            console.log("BUBUBUBU", dataURL);
            return dataURL;
        };

        useEffect(() => {
            if (onExportReady) {
                onExportReady(handleExport);
            }
        }, [onExportReady]);

        const handleGraphicDragStart = () => {
            // While dragging the graphic, we don't want the stage to move
            setIsDraggingGraphic(true);
        };

        const handleGraphicDragEnd = (e) => {
            setIsDraggingGraphic(false);
            if (isGraphicDraggable) {
                setPosition({ x: e.target.x(), y: e.target.y() });
            }
            console.log(purchaseData.sides.front.xPosition, purchaseData.sides.front.yPosition);
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

        return (
            <div style={{ touchAction: "none" }}>
                <Stage
                    ref={stageRef}
                    className="mix-blend-multiply"
                    width={containerWidth}
                    height={containerHeight}
                    scaleX={zoomLevel}
                    scaleY={zoomLevel}
                    draggable={!isDraggingGraphic} /* Stage not draggable while dragging graphic */
                    x={stagePosition.x}
                    y={stagePosition.y}
                    // onDragEnd={(e) => setStagePosition({ x: e.target.x(), y: e.target.y() })}
                    onMouseOver={() => stageRef.current && (stageRef.current.container().style.cursor = "grab")}
                    onMouseOut={() => stageRef.current && (stageRef.current.container().style.cursor = "default")}
                >
                    <Layer>
                        {productImage && <KonvaImage ref={productImageRef} />}
                        {(uploadedGraphicFile || uploadedGraphicURL) && (
                            <KonvaImage
                                ref={uploadedGraphicRef}
                                draggable={isGraphicDraggable}
                                x={position.x}
                                y={position.y}
                                scaleX={scale}
                                scaleY={scale}
                                onDragStart={handleGraphicDragStart}
                                onDragEnd={handleGraphicDragEnd}
                                onTransformEnd={handleGraphicTransformEnd}
                            />
                        )}
                        {(uploadedGraphicFile || uploadedGraphicURL) && showTransformer && (
                            <Transformer
                                ref={transformerRef}
                                boundBoxFunc={(oldBox, newBox) => {
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
                    <Button onClick={handleResetZoom} className=" !hidden lg:!block" variant="contained">
                        <FiRefreshCw />
                    </Button>
                </div>
            </div>
        );
    }
);

KonvaLayer.displayName = "KonvaLayer";

export default KonvaLayer;
