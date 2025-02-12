// utils/imagePositioning.js

export default function getImagePlacement({
    containerWidth,
    containerHeight,
    imageNaturalWidth,
    imageNaturalHeight,
    desiredWidth = 120,
    desiredHeight = 120,
    centerImage = true,
    isMobile,
}) {
    // Calculate the final displayed width and height
    // If you want to keep a fixed size, just use desiredWidth and desiredHeight.
    // If you want to scale proportionally:
    const aspectRatio = imageNaturalWidth / imageNaturalHeight;
    let finalWidth = desiredWidth;
    let finalHeight = desiredHeight;

    if (aspectRatio > 1) {
        // Landscape
        finalHeight = finalWidth / aspectRatio;
    } else {
        // Portrait or square
        finalWidth = finalHeight * aspectRatio;
    }

    // Decide on offsets. If the image should scale/rotate from the center:
    // const offsetX = finalWidth / 2;
    // const offsetY = finalHeight / 2;
    const offsetX = 0;
    const offsetY = 0;

    // Determine the center position
    const x = centerImage ? containerWidth / 2 : (containerWidth - finalWidth) / 2;
    const y = centerImage ? containerHeight / 2 : (containerHeight - finalHeight) / 2;

    // If scaling is needed, you can return a scale factor as well
    // For example, if `scale` is controlled outside, just return x, y, offsetX, offsetY
    // For now, assume scale is 1:
    const scale = 1;

    return {
        x,
        y,
        scale,
        offsetX,
        offsetY,
        finalWidth,
        finalHeight,
    };
}

// --- New function ---
// This function is used only if the product has a konfigBox.
// It applies the following logic:
// - If the bounding box’s width OR height is below 200px, scale the image so it fills the box.
// - Otherwise (if both dimensions are at least 200px), use a scale of 1 if the image fits,
//   or shrink it (if needed) so it fits.
export function getFixedImagePlacement({
    imageNaturalWidth,
    imageNaturalHeight,
    boundingRect, // { x, y, width, height }
    centerImage = true,
}) {
    let scaleFactor;

    // For a "small" bounding box, fill it completely.
    if (boundingRect.width < 200 || boundingRect.height < 200) {
        scaleFactor = Math.min(boundingRect.width / imageNaturalWidth, boundingRect.height / imageNaturalHeight);
    } else {
        // For larger bounding boxes, use natural size (scale=1) if it fits
        // Otherwise, scale down to fit.
        if (imageNaturalWidth <= boundingRect.width && imageNaturalHeight <= boundingRect.height) {
            scaleFactor = 1;
        } else {
            scaleFactor = Math.min(boundingRect.width / imageNaturalWidth, boundingRect.height / imageNaturalHeight);
        }
    }

    const finalWidth = imageNaturalWidth * scaleFactor;
    const finalHeight = imageNaturalHeight * scaleFactor;

    let x, y;
    if (centerImage) {
        // Center the image inside the bounding box.
        x = boundingRect.x + (boundingRect.width - finalWidth) / 2;
        y = boundingRect.y + (boundingRect.height - finalHeight) / 2;
    } else {
        x = boundingRect.x;
        y = boundingRect.y;
    }

    return {
        x,
        y,
        finalWidth,
        finalHeight,
        scale: scaleFactor,
        offsetX: 0,
        offsetY: 0,
    };
}
