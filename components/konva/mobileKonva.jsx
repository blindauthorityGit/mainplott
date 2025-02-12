import React, { useRef, useEffect, useState, forwardRef } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from "react-konva";
import Konva from "konva";
import useStore from "@/store/store";
import { Button, IconButton } from "@mui/material";
import { FiRefreshCw, FiEdit, FiSave } from "react-icons/fi";
import { BiRefresh } from "react-icons/bi";
import { FaArrowsRotate } from "react-icons/fa6"; // <-- React icon
import MobileSliders from "@/components/productConfigurator/mobile/mobileSliders";
import getImagePlacement, { getFixedImagePlacement } from "@/functions/getImagePlacement";
import { exportCanvas } from "@/functions/exportCanvas";
import useIsMobile from "@/hooks/isMobile";

/**
 * MobileKonvaLayer
 *
 * - Explicitly attaches Transformer to uploaded graphic in edit mode.
 * - Stage has listening={isEditing}, so we can scroll over the canvas when editing is off.
 * - Always visible Transformer border in edit mode (no hover logic).
 * - Page scrolling is fully available when editing is off (body overflow auto).
 * - NEW: A round button with a React icon for toggling product sides when not editing.
 */
const MobileKonvaLayer = forwardRef(
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

        const [copyFrontToBack, setCopyFrontToBack] = useState(false);

        const { purchaseData, setPurchaseData, setStageRef, setTransformerRef } = useStore();
        const { containerWidth, containerHeight } = purchaseData;

        // Track load states
        const [productImageLoaded, setProductImageLoaded] = useState(false);
        const [graphicLoaded, setGraphicLoaded] = useState(false);

        // Combined loaded
        const isImagesLoaded = productImageLoaded && (!uploadedGraphicFile || graphicLoaded);

        // Zoom
        const [zoomLevel, setZoomLevel] = useState(1);
        const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

        // Mobile edit toggle
        const [isEditing, setIsEditing] = useState(false);

        const isMobile = useIsMobile();
        // Get the current side data from the store.
        const currentSide = purchaseData.currentSide;
        const currentSideData = purchaseData.sides[currentSide] || {};

        // Set up stage & transformer references
        useEffect(() => {
            setStageRef(stageRef.current);
            setTransformerRef(transformerRef.current);
            return () => {
                setStageRef(null);
                setTransformerRef(null);
            };
        }, [setStageRef, setTransformerRef]);

        // Disable page scrolling in edit mode; enable otherwise
        useEffect(() => {
            if (typeof document !== "undefined") {
                document.body.style.overflow = isEditing ? "hidden" : "auto";
            }
        }, [isEditing]);

        // -------------------------------------------
        // Product Image Load
        // -------------------------------------------
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

        // -------------------------------------------
        // Uploaded Graphic Load
        // -------------------------------------------
        useEffect(() => {
            if (!uploadedGraphicFile) return;

            const currentSideData = purchaseData.sides?.[purchaseData.currentSide] || {};
            const isPDFSide = currentSideData.isPDF;
            const pdfPreviewURL = currentSideData.preview;

            function placeAndDraw(loadedImg) {
                if (!uploadedGraphicRef.current) return;

                let placement;
                if (purchaseData.product.konfigBox && purchaseData.product.konfigBox.value) {
                    // Use your new fixed placement logic for products with a konfigBox.
                    placement = getFixedImagePlacement({
                        imageNaturalWidth: loadedImg.width,
                        imageNaturalHeight: loadedImg.height,
                        boundingRect, // boundingRect is computed below (or earlier) based on purchaseData
                        centerImage: true,
                    });
                } else {
                    // Otherwise, use the original helper.
                    placement = getImagePlacement({
                        containerWidth,
                        containerHeight,
                        imageNaturalWidth: loadedImg.width,
                        imageNaturalHeight: loadedImg.height,
                        isMobile,
                    });
                }

                // For mobile, if needed, you might decide to divide the dimensions by 2 (as in your original code)
                // or use them directly.
                // (Adjust the division factor if necessary.)
                uploadedGraphicRef.current.width(placement.finalWidth / 2);
                uploadedGraphicRef.current.height(placement.finalHeight / 2);

                // For konfigBox-based placement, apply the calculated x and y.
                if (purchaseData.product.konfigBox && purchaseData.product.konfigBox.value) {
                    uploadedGraphicRef.current.x(placement.x);
                    uploadedGraphicRef.current.y(placement.y);
                }
                // Otherwise, you might rely on other default positioning.

                uploadedGraphicRef.current.offsetX(0);
                uploadedGraphicRef.current.offsetY(0);
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
            }

            // PDF preview or normal image
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
                    console.log(purchaseData);
                };
                reader.readAsDataURL(uploadedGraphicFile);
            }
        }, [
            uploadedGraphicFile,
            uploadedGraphicURL,
            containerWidth,
            containerHeight,
            purchaseData.currentSide,
            setPurchaseData,
            purchaseData.sides,
        ]);

        // -------------------------------------------
        // Attach to Transformer whenever editing + loaded
        // -------------------------------------------
        useEffect(() => {
            if (!transformerRef.current) return;

            // If editing and the graphic is loaded, attach it to the transformer
            if (isEditing && graphicLoaded && uploadedGraphicRef.current) {
                transformerRef.current.nodes([uploadedGraphicRef.current]);
                transformerRef.current.getLayer().batchDraw();
            } else {
                // Otherwise, detach
                transformerRef.current.nodes([]);
            }
        }, [isEditing, graphicLoaded]);

        // -------------------------------------------
        // Export
        // -------------------------------------------
        const handleExport = () => {
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

        const handleGraphicUpload = async (event) => {
            console.log("UPLOADED");
            const newFile = event.target.files[0];

            const image = new Image();
            image.src = URL.createObjectURL(newFile);
            console.log(purchaseData.containerWidth, purchaseData.containerHeight);
            image.onload = () => {
                const imageWidth = image.width;
                const imageHeight = image.height;
                console.log(purchaseData.containerWidth, purchaseData.containerHeight, imageWidth, imageHeight);
                const { x, y } = getImagePlacement({
                    containerWidth: purchaseData.containerWidth,
                    containerHeight: purchaseData.containerHeight,
                    imageNaturalWidth: image.width,
                    imageNaturalHeight: image.height,
                });
                console.log("MEINE FUNCTION", x, y, currentSide);
                // Calculate centered position
                const centeredX = (purchaseData.containerWidth - imageWidth) / 2;
                const centeredY = (purchaseData.containerHeight - imageHeight) / 2;

                console.log("SPOSITIONE", centeredX, centeredY);

                setPurchaseData({
                    ...purchaseData,
                    sides: {
                        ...purchaseData.sides,
                        [currentSide]: {
                            ...purchaseData.sides[currentSide],
                            xPosition: x,
                            yPosition: y,
                        },
                    },
                });
            };

            if (newFile) {
                await handleFileUpload({
                    newFile,
                    currentSide,
                    purchaseData,
                    setUploadedFile,
                    setPurchaseData,
                    setModalOpen,
                    setShowSpinner,
                    setModalContent,
                    setUploading,
                    setUploadError,
                    setColorSpace,
                    setDpi,
                    steps,
                    currentStep,
                    setCurrentStep,
                });
            }
        };

        const handleCopyFrontToBack = (event) => {
            // const isChecked = event.target.checked;
            setCopyFrontToBack(true);
            console.log(purchaseData);

            if (purchaseData.sides.front.uploadedGraphicFile || purchaseData.sides.front.uploadedGraphic) {
                console.log(purchaseData);

                // Retrieve stored graphic dimensions and current scale from the front side
                const graphicWidth = purchaseData.sides.front.width || 0;
                const graphicHeight = purchaseData.sides.front.height || 0;
                const scale = purchaseData.sides.front.scale || 1;

                // Compute the displayed (scaled) dimensions
                const displayedWidth = graphicWidth * scale;
                const displayedHeight = graphicHeight * scale;

                // Compute centered positions so that the graphic's center aligns with the container's center
                const centeredX = (purchaseData.containerWidth - displayedWidth) / 2;
                const centeredY = (purchaseData.containerHeight - displayedHeight) / 2;

                // Copy front design to back, resetting rotation and using the centered positions
                setPurchaseData({
                    ...purchaseData,
                    sides: {
                        ...purchaseData.sides, // Keep both front and back
                        back: {
                            ...purchaseData.sides.front, // Cop y allfront design properties to back
                            xPosition: centeredX,
                            yPosition: centeredY,
                            rotation: 0, // Reset rotation for the back side
                        },
                    },
                });
            }
        };

        const renderButtonContainer = () => {
            if (!currentSideData.uploadedGraphicFile) {
                return (
                    <>
                        {/* <Button
                            variant="contained"
                            component="label"
                            sx={{
                                mt: 1.5, // Tailwind equivalent for mt-6
                                px: 3, // Tailwind equivalent for px-6
                                py: 1, // Tailwind equivalent for py-2
                                backgroundColor: "#ba979d",
                                color: "white",
                                fontFamily: "Montserrat",
                                borderRadius: "8px",
                                "&:hover": {
                                    backgroundColor: "#F3EEC3", // you could use your accent color light variant
                                },
                                boxShadow: "none",
                                width: "100%",
                            }}
                        >
                            Datei hochladen
                            <input type="file" hidden onChange={handleGraphicUpload} />
                        </Button>
                        {currentSide === "back" && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleCopyFrontToBack}
                                sx={{
                                    mt: 1.5,
                                    px: 3,
                                    py: 1,ad
                                    backgroundColor: "#393836",
                                    color: "white",
                                    fontFamily: "Montserrat",
                                    borderRadius: "8px",
                                    "&:hover": {
                                        backgroundColor: "#393836",
                                    },
                                    boxShadow: "none",
                                    width: "100%",
                                }}
                            >
                                Front Design kopieren
                            </Button>
                        )} */}
                    </>
                );
            } else {
                // Graphic exists: show Edit button if not editing, Save button if editing.
                return (
                    <>
                        {!isEditing && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleEditToggle}
                                startIcon={<FiEdit size={20} />}
                                sx={{
                                    background: "#bb969d",
                                    width: "100%",
                                }}
                            >
                                BEARBEITEN
                            </Button>
                        )}
                        {isEditing && (
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleSave}
                                startIcon={<FiSave size={20} />}
                                sx={{
                                    background: "#297373",
                                    width: "100%",
                                }}
                            >
                                SAVE
                            </Button>
                        )}
                    </>
                );
            }
        };

        // -------------------------------------------
        // Transform / Drag Handlers
        // -------------------------------------------
        const handleGraphicDragEnd = (e) => {
            if (isEditing) {
                setPosition({ x: e.target.x(), y: e.target.y() }, e.target.rotation());
            }
        };

        const handleGraphicTransform = (e) => {
            if (isEditing) {
                // uniform scale
                const currentScale = e.target.scaleX();
                setScale(currentScale);
            }
        };

        const handleGraphicTransformEnd = (e) => {
            if (isEditing) {
                const newScale = Math.min(e.target.scaleX(), 3.5);
                setScale(newScale);
                e.target.scaleX(newScale);
                e.target.scaleY(newScale);
                const newRotation = e.target.rotation();
                setPosition({ x: e.target.x(), y: e.target.y() }, newRotation);
                e.target.getLayer().batchDraw();
            }
        };

        // -------------------------------------------
        // Bounding Logic
        // -------------------------------------------
        const dragBoundFunc = (pos) => {
            if (!isEditing) {
                return pos; // no bounding if not editing
            }
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
            if (!isEditing) {
                return newBox; // no bounding if not editing
            }
            const boundingRectNode = boundaryRectRef.current;
            if (!boundingRectNode || !uploadedGraphicRef.current) return newBox;

            const boundingRect = boundingRectNode.getClientRect();

            if (
                newBox.x < boundingRect.x ||
                newBox.y < boundingRect.y ||
                newBox.x + newBox.width > boundingRect.x + boundingRect.width ||
                newBox.y + newBox.height > boundingRect.y + boundingRect.height
            ) {
                return oldBox;
            }
            return newBox;
        };

        // -------------------------------------------
        // Reset Zoom
        // -------------------------------------------
        const handleResetZoom = () => {
            setZoomLevel(1);
            setStagePosition({ x: 0, y: 0 });
            if (stageRef.current) {
                stageRef.current.scale({ x: 1, y: 1 });
                stageRef.current.position({ x: 0, y: 0 });
                stageRef.current.batchDraw();
            }
        };

        // Parent reset
        useEffect(() => {
            if (resetHandler) {
                resetHandler(() => handleResetZoom());
            }
        }, [resetHandler]);

        // Reset zoom on side switch
        useEffect(() => {
            handleResetZoom();
        }, [purchaseData.currentSide]);

        // boundingRect
        const boundingRect = {
            x: containerWidth * 0.22,
            y: containerHeight * 0.15,
            width: containerWidth * 0.55,
            height: containerHeight * 0.76,
        };

        useEffect(() => {
            setPurchaseData((prev) => ({
                ...prev,
                boundingRect,
            }));
        }, [containerWidth, containerHeight, setPurchaseData]);

        useEffect(() => {
            if (stageRef.current) {
                stageRef.current.batchDraw();
            }
        }, [purchaseData.configurator]);

        // Stage is not draggable on mobile
        // listening={isEditing} => ignore all pointer events if not editing
        const stageIsDraggable = false;

        // -------------------------------------------
        // Mobile Edit / Save
        // -------------------------------------------
        const handleEditToggle = () => {
            setIsEditing(true);
        };
        const handleSave = () => {
            setIsEditing(false);
        };

        // -------------------------------------------
        // Change Side (round button with a React icon)
        // -------------------------------------------
        const handleSideChange = () => {
            // Suppose we want to toggle between front/back
            // If you want a direct approach with newValue=0 or 1, you can do so:
            const nextValue = purchaseData.currentSide === "front" ? 1 : 0;
            console.log(purchaseData.currentSide);
            // Then set currentSide based on nextValue
            setPurchaseData((prevState) => ({
                ...prevState,
                currentSide: nextValue === 0 ? "front" : "back",
            }));
        };

        // Container style: let the user scroll if not editing
        const containerStyle = {
            // If isEditing => "none" (prevent page pinch/scroll).
            // Otherwise => "auto" so they can scroll *over* the canvas.
            touchAction: isEditing ? "none" : "auto",
            opacity: isImagesLoaded ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
            position: "relative",
        };

        return (
            <div style={containerStyle}>
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
                    listening={isEditing} // only catch events in edit mode
                >
                    <Layer>
                        {/* Product Image */}
                        {productImage && <KonvaImage ref={productImageRef} />}

                        {/* Boundary Rect */}
                        <Rect
                            ref={boundaryRectRef}
                            x={boundingRect.x}
                            y={boundingRect.y}
                            width={boundingRect.width}
                            height={boundingRect.height}
                        />

                        {/* Uploaded Graphic */}
                        {(uploadedGraphicFile || uploadedGraphicURL) && (
                            <KonvaImage
                                ref={uploadedGraphicRef}
                                crossOrigin="anonymous"
                                draggable={isEditing}
                                x={position.x}
                                y={position.y}
                                scaleX={scale}
                                scaleY={scale}
                                rotation={position.rotation || 0}
                                onDragEnd={handleGraphicDragEnd}
                                onTransform={handleGraphicTransform}
                                onTransformEnd={handleGraphicTransformEnd}
                                dragBoundFunc={dragBoundFunc}
                            />
                        )}

                        {/* Transformer: explicitly shown in edit mode */}
                        {isEditing && (uploadedGraphicFile || uploadedGraphicURL) && (
                            <Transformer
                                ref={transformerRef}
                                boundBoxFunc={boundBoxFunc}
                                borderStroke="#FFFFFF"
                                anchorStroke="#A42CD6"
                                anchorFill="#A42CD6"
                            />
                        )}
                    </Layer>
                </Stage>

                {/* EDIT / SAVE Buttons (fade in/out) */}
                {/* Button Container: Centered vertically and horizontally */}
                <div className="mt-4">{renderButtonContainer()}</div>

                {/* Zoom & Reset (fade in/out in edit mode) */}
                <div
                    className="w-full"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        transition: "opacity 0.3s ease-in-out",
                        opacity: isEditing ? 1 : 0,
                        pointerEvents: isEditing ? "auto" : "none",
                        zIndex: 100,
                    }}
                >
                    <MobileSliders
                        containerWidth={containerWidth}
                        containerHeight={containerHeight}
                        zoomLevel={zoomLevel}
                        setZoomLevel={(val) => {
                            const clampedZoom = Math.max(1, Math.min(val, 3));
                            setZoomLevel(clampedZoom);
                            if (stageRef.current) {
                                stageRef.current.scale({ x: clampedZoom, y: clampedZoom });
                                stageRef.current.batchDraw();
                            }
                        }}
                    />
                </div>

                {/* 
          Side-change button:
          - Only visible if not editing
          - Round shape with React icon 
        */}
                {/* <IconButton
                    onClick={handleSideChange}
                    sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        borderRadius: "50%",
                        width: 56,
                        height: 56,
                        backgroundColor: "#393836",
                        color: "#fff",
                        transition: "opacity 0.3s ease-in-out",
                        opacity: isEditing ? 0 : 1,
                        pointerEvents: isEditing ? "none" : "auto",
                        boxShadow: "0px 2px 5px rgba(0,0,0,0.3)",
                    }}
                >
                    <FaArrowsRotate size={24} />
                </IconButton> */}
                <button
                    onClick={handleSideChange}
                    className="absolute -top-1 right-4 bg-white p-2 text-textColor rounded-full shadow-md"
                    style={{ opacity: isEditing ? 0 : 1 }}
                >
                    <BiRefresh size={24} />
                </button>
            </div>
        );
    }
);

MobileKonvaLayer.displayName = "MobileKonvaLayer";
export default MobileKonvaLayer;
