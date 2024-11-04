import React, { useRef, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";

const KonvaLayer = ({ productImage, uploadedGraphic, boundaries, position, setPosition, scale, setScale }) => {
    // Create references for the Konva stage and layers
    const stageRef = useRef(null);
    const productImageRef = useRef(null);
    const uploadedGraphicRef = useRef(null);

    // Load the product image into the Konva image element
    useEffect(() => {
        if (productImage) {
            const img = new window.Image();
            img.src = productImage;
            img.onload = () => {
                if (productImageRef.current) {
                    productImageRef.current.image(img);
                    productImageRef.current.getLayer().batchDraw();
                }
            };
        }
    }, [productImage]);

    // Load the uploaded graphic into the Konva image element
    useEffect(() => {
        if (uploadedGraphic) {
            const img = new window.Image();
            img.src = URL.createObjectURL(uploadedGraphic);
            img.onload = () => {
                if (uploadedGraphicRef.current) {
                    uploadedGraphicRef.current.image(img);
                    uploadedGraphicRef.current.getLayer().batchDraw();
                }
            };
        }
    }, [uploadedGraphic]);

    // Handle drag boundaries for the uploaded graphic
    const handleDragBoundFunc = (pos) => {
        const { MIN_X, MAX_X, MIN_Y, MAX_Y } = boundaries;

        return {
            x: Math.max(MIN_X, Math.min(MAX_X, pos.x)),
            y: Math.max(MIN_Y, Math.min(MAX_Y, pos.y)),
        };
    };

    return (
        <Stage ref={stageRef} width={500} height={600}>
            <Layer>
                {/* Product Image - background */}
                <KonvaImage ref={productImageRef} x={0} y={0} width={500} height={600} />

                {/* Uploaded Graphic - draggable and scalable */}
                {uploadedGraphic && (
                    <KonvaImage
                        ref={uploadedGraphicRef}
                        draggable
                        x={position.x}
                        y={position.y}
                        scaleX={scale}
                        scaleY={scale}
                        dragBoundFunc={handleDragBoundFunc}
                        onDragEnd={(e) => {
                            setPosition({ x: e.target.x(), y: e.target.y() });
                        }}
                        onTransformEnd={(e) => {
                            // Scale is applied via transform, hence we update the state
                            const newScale = e.target.scaleX();
                            setScale(newScale);
                        }}
                    />
                )}
            </Layer>
        </Stage>
    );
};

export default KonvaLayer;
