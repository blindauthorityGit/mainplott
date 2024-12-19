// utils/getAbsolutePosition.js

import { templateRelativePositions } from "./templatePositions";

/**
 * Calculates the absolute position based on relative percentages.
 *
 * @param {string} side - "front" or "back".
 * @param {string} templateName - The name of the template (e.g., "Brust links oben").
 * @param {number} containerWidth - The width of the container in pixels.
 * @param {number} containerHeight - The height of the container in pixels.
 * @returns {Object} - An object containing absolute x and y coordinates.
 */
export function getAbsolutePosition(side, templateName, containerWidth, containerHeight) {
    const templates = templateRelativePositions[side];
    const template = templates.find((t) => t.name === templateName && t.enabled);

    if (!template) {
        console.warn(`Template "${templateName}" not found for side "${side}".`);
        return { x: 0, y: 0 };
    }

    const x = containerWidth * template.xPercent;
    const y = containerHeight * template.yPercent;

    return { x, y };
}
