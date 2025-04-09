import { isB2BUser, getUserPiecePrice, getUserTotalPrice } from "./priceHelpers";

export const calculateTotalPrice = (
    variants,
    product,
    discountData,
    setDiscountApplied,
    veredelungen = {},
    purchaseData
) => {
    // 1) net base total (for product items only)
    let netBaseTotal = 0;
    let totalQuantity = 0;

    // For sub-variant mode vs. normal mode
    const useSubVariantMapping = product.tags && product.tags.includes("Kugelschreiber");

    // We'll also track how many "product" pieces (not services) there are, ignoring veredelung, layout, etc.
    Object.entries(variants).forEach(([key, variant]) => {
        // skip "profiDatenCheck" and "layoutService" from the base product calc
        if (key === "profiDatenCheck" || key === "layoutService") {
            return;
        }

        // Normal T-shirt or pen variant
        let matchingEdge;
        if (useSubVariantMapping) {
            matchingEdge = product.variants.edges.find((edge) => {
                const opts = edge.node.selectedOptions;
                const matchesSize = opts.some((o) => o.name === "Größe" && o.value === variant.size);
                const matchesColor = opts.some((o) => o.name === "Farbe" && o.value === variant.color);
                return matchesSize && matchesColor;
            });
        } else {
            matchingEdge = product.variants.edges.find((edge) => {
                const opts = edge.node.selectedOptions;
                return opts.some((o) => o.name === "Größe" && o.value === variant.size);
            });
        }

        const netVariantPrice = matchingEdge ? parseFloat(matchingEdge.node.priceV2.amount) : 0;

        netBaseTotal += (variant.quantity || 0) * netVariantPrice;
        totalQuantity += variant.quantity || 0;
    });

    // 2) net base price per piece
    let netBasePricePerPiece = 0;
    if (totalQuantity > 0) {
        netBasePricePerPiece = netBaseTotal / totalQuantity;
    }

    // -- PRODUCT DISCOUNT (From discountData) --
    // We'll interpret "discountSum" as "how many euros discount per piece."
    let productDiscountNet = 0; // This is how many net euros are discounted from the base items

    // 3) discount logic for base items
    let appliedDiscountPercentage = 0;
    if (discountData) {
        const found = discountData.find(
            (tier) =>
                totalQuantity >= tier.minQuantity && (tier.maxQuantity == null || totalQuantity <= tier.maxQuantity)
        );
        if (found) {
            // If your data has "discountSum": 0.7 => means 0.7 EUR discount per piece
            if (found.discountSum) {
                productDiscountNet = (found.discountSum || 0) * totalQuantity;
            }

            appliedDiscountPercentage = found.discountPercentage || 0;

            // If you also want to actually reduce netBaseTotal by that discount,
            // you can do so. For example:
            netBaseTotal = netBaseTotal - productDiscountNet;
            netBasePricePerPiece = totalQuantity > 0 ? netBaseTotal / totalQuantity : 0;

            setDiscountApplied(true);
        } else {
            setDiscountApplied(false);
        }
    } else {
        setDiscountApplied(false);
    }

    // 4) veredelung (we keep the logic but ignore for "productDiscount")
    let netVeredelungTotal = 0;
    const veredelungPerPiece = {};
    const sides = ["front", "back"];
    if (totalQuantity > 0) {
        sides.forEach((side) => {
            if (purchaseData.sides[side]?.uploadedGraphic || purchaseData.sides[side]?.uploadedGraphicFile) {
                const vData = veredelungen[side];
                if (vData) {
                    let netSidePricePerPiece = parseFloat(vData.price) || 0;
                    // discount on veredelung? We'll skip it for "productDiscount"
                    const match = vData.preisReduktion.discounts.find(
                        (tier) =>
                            totalQuantity >= tier.minQuantity &&
                            (tier.maxQuantity == null || totalQuantity <= tier.maxQuantity)
                    );
                    if (match) {
                        netSidePricePerPiece *= 1 - match.discountPercentage / 100;
                    }
                    netVeredelungTotal += netSidePricePerPiece * totalQuantity;
                    veredelungPerPiece[side] = netSidePricePerPiece.toFixed(2);
                }
            }
        });
    }

    // net final after product discount + veredelung
    const finalNetTotal = netBaseTotal + netVeredelungTotal;
    let netPricePerPiece = 0;
    if (totalQuantity > 0) {
        netPricePerPiece = finalNetTotal / totalQuantity;
    }

    // 5) convert net => user-based
    const userPiecePrice = getUserPiecePrice(netPricePerPiece);
    const userTotal = parseFloat((userPiecePrice * totalQuantity).toFixed(2));

    // convert veredelungPerPiece => user-based
    const userVeredelungPerPiece = {};
    Object.entries(veredelungPerPiece).forEach(([side, netVal]) => {
        userVeredelungPerPiece[side] = getUserPiecePrice(parseFloat(netVal)).toFixed(2);
    });

    // Also convert the productDiscount from net to user-based:
    const userProductDiscount = productDiscountNet;

    return {
        totalPrice: userTotal.toFixed(2),
        pricePerPiece: userPiecePrice.toFixed(2),
        appliedDiscountPercentage,

        // This is your normal veredelung fields
        veredelungTotal: (userTotal - (userPiecePrice * totalQuantity - netBaseTotal)).toFixed(2),
        veredelungPerPiece: userVeredelungPerPiece,

        // *** NEW: "productDiscount" => the total discount from quantity tiers (in user-based currency)
        productDiscount: Number(userProductDiscount.toFixed(2)),
    };
};
