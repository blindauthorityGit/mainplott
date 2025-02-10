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
