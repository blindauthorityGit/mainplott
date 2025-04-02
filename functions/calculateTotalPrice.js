import { isB2BUser, getUserPiecePrice, getUserTotalPrice } from "./priceHelpers";
// or wherever your B2B/B2C helpers live

export const calculateTotalPrice = (
    variants,
    product,
    discountData,
    setDiscountApplied,
    veredelungen = {},
    purchaseData
) => {
    // 1) net base total
    let netBaseTotal = 0;
    let totalQuantity = 0;

    // For sub-variant mode vs. normal mode
    const useSubVariantMapping = product.tags && product.tags.includes("Kugelschreiber");

    Object.values(variants).forEach((variant) => {
        // Attempt to find the correct product variant
        let matchingEdge;
        if (useSubVariantMapping) {
            // e.g. "Kugelschreiber" => must match both size + color if your store has size=Standard
            matchingEdge = product.variants.edges.find((edge) => {
                const opts = edge.node.selectedOptions;
                const matchesSize = opts.some((o) => o.name === "Größe" && o.value === variant.size);
                const matchesColor = opts.some((o) => o.name === "Farbe" && o.value === variant.color);
                return matchesSize && matchesColor;
            });
        } else {
            // e.g. textile => only match size (ignore color if user never picked it)
            matchingEdge = product.variants.edges.find((edge) => {
                const opts = edge.node.selectedOptions;
                // If your store uses a 'Größe' option, match that:
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

    // 3) discount logic (NET)
    let appliedDiscountPercentage = 0;
    if (discountData) {
        const found = discountData.find(
            (tier) =>
                totalQuantity >= tier.minQuantity && (tier.maxQuantity == null || totalQuantity <= tier.maxQuantity)
        );
        if (found) {
            appliedDiscountPercentage = found.discountPercentage;
            const discountFactor = 1 - found.discountPercentage / 100;
            netBaseTotal *= discountFactor;
            netBasePricePerPiece *= discountFactor;
            setDiscountApplied(true);
        } else {
            setDiscountApplied(false);
        }
    } else {
        setDiscountApplied(false);
    }

    // 4) add veredelung
    let netVeredelungTotal = 0;
    const veredelungPerPiece = {};
    const sides = ["front", "back"];
    if (totalQuantity > 0) {
        sides.forEach((side) => {
            if (purchaseData.sides[side]?.uploadedGraphic || purchaseData.sides[side]?.uploadedGraphicFile) {
                const vData = veredelungen[side];
                if (vData) {
                    let netSidePricePerPiece = parseFloat(vData.price) || 0;
                    // discount on veredelung?
                    const match = vData.preisReduktion.discounts.find(
                        (tier) =>
                            totalQuantity >= tier.minQuantity &&
                            (tier.maxQuantity == null || totalQuantity <= tier.maxQuantity)
                    );
                    if (match) {
                        netSidePricePerPiece *= 1 - match.discountPercentage / 100;
                    }
                    netVeredelungTotal += netSidePricePerPiece * totalQuantity;
                    veredelungPerPiece[side] = netSidePricePerPiece.toFixed(2); // net
                }
            }
        });
    }

    // net final
    const finalNetTotal = netBaseTotal + netVeredelungTotal;
    let netPricePerPiece = 0;
    if (totalQuantity > 0) {
        netPricePerPiece = finalNetTotal / totalQuantity;
    }

    // 5) convert net => user-based
    const userPiecePrice = getUserPiecePrice(netPricePerPiece);
    const userTotal = parseFloat((userPiecePrice * totalQuantity).toFixed(2));

    // optional: convert veredelungPerPiece => user-based
    const userVeredelungPerPiece = {};
    Object.entries(veredelungPerPiece).forEach(([side, netVal]) => {
        userVeredelungPerPiece[side] = getUserPiecePrice(parseFloat(netVal)).toFixed(2);
    });

    return {
        totalPrice: userTotal.toFixed(2),
        pricePerPiece: userPiecePrice.toFixed(2),
        appliedDiscountPercentage,
        veredelungTotal: (userTotal - (userPiecePrice * totalQuantity - netBaseTotal)).toFixed(2),
        veredelungPerPiece: userVeredelungPerPiece,
    };
};
