import { getUserPiecePrice } from "./priceHelpers";

export function calculateTotalPriceAllInclusive(variants, product, discountData, purchaseData) {
    // 1) net base price
    const baseNetPrice = parseFloat(product.variants.edges[0].node.priceV2.amount) || 0;

    // 2) Gather keys that are NOT layoutService, profiDatenCheck, "Standard" (if you skip that)
    const baseQuantityKeys = Object.keys(variants).filter((k) => {
        if (["layoutService", "profiDatenCheck"].includes(k)) return false;
        if (product.tags.includes("Kugelschreiber") && k === "Standard") return false;
        return true;
    });

    let totalQuantity = baseQuantityKeys.reduce((sum, key) => sum + (variants[key].quantity || 0), 0);

    // 3) minOrder from product
    let minOrder = 0;
    if (product.mindestBestellSumme?.value) {
        minOrder = parseInt(product.mindestBestellSumme.value, 10);
    } else if (product.mindestBestellMenge?.value) {
        minOrder = parseInt(product.mindestBestellMenge.value, 10);
    }

    // If totalQuantity is below min, we charge min
    const effectiveQuantity = totalQuantity === 0 ? 0 : Math.max(totalQuantity, minOrder);

    // 4) Check discount
    let appliedDiscountPercentage = 0;
    let discountMultiplier = 1;
    if (discountData) {
        const found = discountData.find(
            (tier) =>
                totalQuantity >= tier.minQuantity && (tier.maxQuantity == null || totalQuantity <= tier.maxQuantity)
        );
        if (found) {
            appliedDiscountPercentage = found.discountPercentage;
            discountMultiplier = 1 - appliedDiscountPercentage / 100;
        }
    }

    // 5) final net price per piece
    const netPricePerPiece = baseNetPrice * discountMultiplier;

    // Convert to user-based
    const userPiecePrice = getUserPiecePrice(netPricePerPiece);
    let finalTotal = userPiecePrice * effectiveQuantity;

    // 6) If we have layoutService => add it directly
    if (variants.layoutService) {
        // If you want to handle net vs gross for layoutService,
        // you can also do piecewise. But if you store it as final "20" for B2C,
        // you might just add 20. This is your design choice.
        const layoutPrice = parseFloat(variants.layoutService.price || 0);
        const layoutQty = variants.layoutService.quantity || 1;
        finalTotal += layoutPrice * layoutQty;
    }

    return {
        totalPrice: finalTotal.toFixed(2),
        pricePerPiece: userPiecePrice.toFixed(2),
        appliedDiscountPercentage,
        totalQuantity,
    };
}
