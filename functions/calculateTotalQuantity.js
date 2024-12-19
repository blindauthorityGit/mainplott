// utils/calculateTotalQuantity.js

/**
 * Calculates the total quantity of size-based variants in purchaseData.
 * Excludes 'profiDatenCheck' and 'veredelungen'.
 *
 * @param {Object} purchaseData - The purchase data object containing variants and other properties.
 * @returns {number} - The total quantity of size variants.
 */
export default function calculateTotalQuantity(purchaseData) {
    const { variants } = purchaseData;
    if (!variants) return 0;

    const totalQuantity = Object.values(variants)
        .filter((variant) => variant.size) // Ensure it's a size variant
        .reduce((total, variant) => total + (variant.quantity || 0), 0);

    return totalQuantity;
}
