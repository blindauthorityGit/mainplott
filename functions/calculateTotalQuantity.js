export default function calculateTotalQuantity(purchaseData) {
    const { variants } = purchaseData;
    if (!variants) return 0;

    // Include variants with either a 'size' or 'color' property.
    const totalQuantity = Object.values(variants)
        .filter((variant) => variant.size || variant.color)
        .reduce((total, variant) => total + (variant.quantity || 0), 0);

    return totalQuantity;
}
