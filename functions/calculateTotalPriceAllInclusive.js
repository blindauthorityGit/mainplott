import { getUserPiecePrice } from "./priceHelpers";

export function calculateTotalPriceAllInclusive(variants, product, discountData, purchaseData) {
    // 1) net base price for the product
    const baseNetPrice = parseFloat(product.variants.edges[0].node.priceV2.amount) || 0;

    // 2) Filter out "layoutService" & "profiDatenCheck" (and maybe "Standard" if sub-variant “Kugelschreiber”)
    const baseQuantityKeys = Object.keys(variants).filter((k) => {
        if (["layoutService", "profiDatenCheck"].includes(k)) return false;
        if (product.tags.includes("Kugelschreiber") && k === "Standard") return false;
        return true;
    });

    // Sum up the T-shirt (or pen) quantities
    let totalQuantity = baseQuantityKeys.reduce((sum, key) => sum + (variants[key].quantity || 0), 0);

    // 3) Apply minOrder logic
    let minOrder = 0;
    if (product.mindestBestellSumme?.value) {
        minOrder = parseInt(product.mindestBestellSumme.value, 10);
    } else if (product.mindestBestellMenge?.value) {
        minOrder = parseInt(product.mindestBestellMenge.value, 10);
    }

    // If totalQuantity < min, we charge for min
    const effectiveQuantity = totalQuantity === 0 ? 0 : Math.max(totalQuantity, minOrder);

    // 4) Discount logic
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
    // Convert that net to user-based (B2B or B2C)
    const userPiecePrice = getUserPiecePrice(netPricePerPiece);

    // Multiply piece price by how many we’re charging for
    let finalTotal = userPiecePrice * effectiveQuantity;

    // -- If we have layoutService, add it to the total
    if (variants.layoutService) {
        const layoutPrice = parseFloat(variants.layoutService.price || 0);
        const layoutQty = variants.layoutService.quantity || 1;
        finalTotal += layoutPrice * layoutQty;
    }

    // -- If we have profiDatenCheck, add it to the total
    if (variants.profiDatenCheck) {
        const checkPrice = parseFloat(variants.profiDatenCheck.price || 0);
        const checkQty = variants.profiDatenCheck.quantity || 1;
        finalTotal += getUserPiecePrice(checkPrice) * checkQty;
    }

    // *** NEW: Calculate the product discount in user currency ***
    // 1) The user-based price if there was NO discount => baseNetPrice converted => times effectiveQuantity
    const userBasePiecePrice = getUserPiecePrice(baseNetPrice);
    const userPriceBeforeDiscount = userBasePiecePrice * effectiveQuantity;
    // 2) The user-based price we actually pay => userPiecePrice * effectiveQuantity
    const userPriceAfterDiscount = userPiecePrice * effectiveQuantity;
    // 3) The difference is the "product discount" in user currency
    let productDiscount = userPriceBeforeDiscount - userPriceAfterDiscount;
    // If negative, clamp to 0
    if (productDiscount < 0) {
        productDiscount = 0;
    }

    // Return original fields + new "productDiscount"
    return {
        totalPrice: finalTotal.toFixed(2),
        pricePerPiece: userPiecePrice.toFixed(2),
        appliedDiscountPercentage,
        totalQuantity,

        // The new field: how much we saved on the product from the quantity discount (in user currency)
        productDiscount: productDiscount.toFixed(2),
    };
}
