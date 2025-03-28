// calculateTotalPriceAllInclusive.js

/**
 * Calculates the total price for an all-inclusive product, enforcing a minimum order.
 *
 * @param {Object} variants - Your purchase variants (keyed by variant identifier).
 * @param {Object} product - The product data from Shopify.
 * @param {Array} discountData - Array of discount tiers (if any).
 * @param {Object} purchaseData - Additional purchase data (may or may not be used).
 * @returns {Object}
 *    - totalPrice (string): The final total (>= minOrder)
 *    - pricePerPiece (string): The per-piece price after discount
 *    - appliedDiscountPercentage (number): The discount actually applied
 *    - totalQuantity (number): The user’s actual total (even if below min)
 */
export const calculateTotalPriceAllInclusive = (variants, product, discountData, purchaseData) => {
    // 1) Base price: if you intend to use the first variant's price from Shopify
    const basePrice = parseFloat(product.variants.edges[0].node.priceV2.amount) || 0;

    // 2) Sum up the ACTUAL total quantity from user selections
    let totalQuantity = Object.values(variants).reduce((sum, variant) => sum + (variant.quantity || 0), 0);

    // 3) Check for a minimum order in product metafields
    let minOrder = 0;
    if (product.mindestBestellSumme?.value) {
        minOrder = parseInt(product.mindestBestellSumme.value, 10);
    } else if (product.mindestBestellMenge?.value) {
        minOrder = parseInt(product.mindestBestellMenge.value, 10);
    }

    // 4) "Effective" quantity for billing:
    //    - if user total is below the min, we still charge minOrder
    //    - if they exceed minOrder, we charge the real total
    const effectiveQuantity = Math.max(totalQuantity, minOrder);

    // 5) Determine if any discount tier applies
    let appliedDiscountPercentage = 0;
    let discountMultiplier = 1;

    if (discountData) {
        // Example logic: apply the discount if the ACTUAL total (not forced) meets the tier
        const applicableDiscount = discountData.find((tier) => {
            const withinRange =
                totalQuantity >= tier.minQuantity && (tier.maxQuantity == null || totalQuantity <= tier.maxQuantity);
            return withinRange;
        });

        if (applicableDiscount) {
            appliedDiscountPercentage = applicableDiscount.discountPercentage;
            discountMultiplier = 1 - appliedDiscountPercentage / 100;
        }
    }

    // 6) Compute discounted price per piece & total
    const discountedPricePerPiece = basePrice * discountMultiplier;
    const totalPrice = discountedPricePerPiece * effectiveQuantity;

    return {
        // Convert to string with 2 decimals if desired
        totalPrice: totalPrice.toFixed(2),
        pricePerPiece: discountedPricePerPiece.toFixed(2),
        appliedDiscountPercentage,
        // Return actual total so your UI knows how many the user selected
        totalQuantity,
    };
};
