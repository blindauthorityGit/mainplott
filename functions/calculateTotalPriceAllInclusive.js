export const calculateTotalPriceAllInclusive = (variants, product, discountData, purchaseData) => {
    // Use net price from Shopify (e.g. 1.15)
    const basePrice = parseFloat(product.variants.edges[0].node.priceV2.amount) || 0;
    const baseQuantityKeys = Object.keys(variants).filter(
        (key) => key !== "layoutService" && key !== "profiDatenCheck"
    );
    let totalQuantity = baseQuantityKeys.reduce((sum, key) => sum + (variants[key].quantity || 0), 0);
    console.log("TOTAL QUANTIOTY: ", totalQuantity);
    // Determine the minimum    order (net)
    let minOrder = 0;
    if (product.mindestBestellSumme?.value) {
        minOrder = parseInt(product.mindestBestellSumme.value, 10);
    } else if (product.mindestBestellMenge?.value) {
        minOrder = parseInt(product.mindestBestellMenge.value, 10);
    }

    const effectiveQuantity = Math.max(totalQuantity, minOrder);

    // Determine discount (if any) using the net values
    let appliedDiscountPercentage = 0;
    let discountMultiplier = 1;
    if (discountData) {
        const applicableDiscount = discountData.find((tier) => {
            return totalQuantity >= tier.minQuantity && (tier.maxQuantity == null || totalQuantity <= tier.maxQuantity);
        });
        if (applicableDiscount) {
            appliedDiscountPercentage = applicableDiscount.discountPercentage;
            discountMultiplier = 1 - appliedDiscountPercentage / 100;
        }
    }

    // Compute discounted price per piece (net) and total net price
    const discountedPricePerPiece = basePrice * discountMultiplier;
    const totalPrice = discountedPricePerPiece * effectiveQuantity;

    return {
        totalPrice: totalPrice.toFixed(2),
        pricePerPiece: discountedPricePerPiece.toFixed(2),
        appliedDiscountPercentage,
        totalQuantity,
    };
};
