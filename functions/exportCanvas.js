export const exportCanvas = (stageRef, transformerRef, boundaryPathRef, scale) => {
    if (!stageRef.current) return null;

    try {
        const originalWidth = stageRef.current.width();
        const originalHeight = stageRef.current.height();
        const originalScale = stageRef.current.scaleX();

        const exportScale = scale;
        const exportWidth = originalWidth * exportScale;
        const exportHeight = originalHeight * exportScale;

        stageRef.current.size({ width: exportWidth, height: exportHeight });
        stageRef.current.scale({ x: exportScale, y: exportScale });

        // Temporarily ensure the transformer and path visibility for export
        if (transformerRef?.current) {
            transformerRef.current.visible(false);
        }
        if (boundaryPathRef?.current) {
            boundaryPathRef.current.visible(false);
        }

        const dataURL = stageRef.current.toDataURL({
            mimeType: "image/png",
            quality: 1,
            backgroundColor: "#ffffff",
        });

        stageRef.current.size({ width: originalWidth, height: originalHeight });
        stageRef.current.scale({ x: originalScale, y: originalScale });
        if (transformerRef.current) {
            transformerRef.current.visible(true);
        }
        if (boundaryPathRef?.current) {
            boundaryPathRef.current.visible(true);
        }
        stageRef.current.batchDraw();

        console.log("dataURLK", dataURL);

        return dataURL; // Return the dataURL instead of downloading
    } catch (err) {
        console.error("Error exporting canvas: ", err);
        return null;
    }
};
