// export function calculateTotalPrice(purchaseVariants, product) {
//     const variants = product.variants.edges; // Get the variants from the product object
//     console.log(variants);
//     // Create a mapping of price for each size and color
//     const priceMap = {};
//     variants.forEach(({ node }) => {
//         const size = node.selectedOptions.find((opt) => opt.name === "Größe")?.value; // Replace "Größe" with your size field
//         const color = node.selectedOptions.find((opt) => opt.name === "Farbe")?.value; // Replace "Farbe" with your color field
//         const price = parseFloat(node.priceV2.amount);
//         console.log(size, color, price);
//         if (size) {
//             if (!priceMap[size]) priceMap[size] = {};
//             priceMap[size][color || "default"] = price;
//         }
//     });

//     // Calculate total price from purchaseVariants
//     let totalPrice = 0;
//     Object.values(purchaseVariants).forEach(({ size, color, quantity }) => {
//         console.log(size, color, quantity);
//         const sizePrices = priceMap[size];
//         if (sizePrices) {
//             const price = sizePrices[color] || sizePrices["default"] || 0; // Use the specific color or fallback to "default"
//             totalPrice += price * quantity;
//         }
//     });
//     console.log(totalPrice);
//     return totalPrice;
// }

export const calculateTotalPrice = (
    variants,
    product,
    discountData,
    setDiscountApplied,
    veredelungen = {}, // Default to an empty object
    purchaseData
) => {
    let totalQuantity = 0;
    let totalPrice = 0;
    let appliedDiscountPercentage = 0; // Track applied discount percentage

    // Calculate total price and total quantity for the base product
    Object.values(variants).forEach((variant) => {
        const variantPrice = product.variants.edges.find(
            (v) =>
                v.node.selectedOptions.some((opt) => opt.name === "Größe" && opt.value === variant.size) &&
                v.node.selectedOptions.some((opt) => opt.name === "Farbe" && opt.value === variant.color)
        )?.node.priceV2.amount;

        if (variantPrice) {
            totalPrice += variant.quantity * parseFloat(variantPrice);
            totalQuantity += variant.quantity;
        }
    });

    // Add Veredelung prices and calculate price per piece for each side
    const veredelungSides = ["front", "back"]; // Keys to check in the `veredelungen` object
    let veredelungTotal = 0;
    const veredelungPerPiece = {}; // Store price per piece for each side

    veredelungSides.forEach((side) => {
        if (purchaseData.sides[side]?.uploadedGraphic || purchaseData.sides[side]?.uploadedGraphicFile) {
            console.log(`Veredelung for ${side} exists.`);
            const veredelungData = veredelungen[side]; // Access Veredelung data directly by key

            if (veredelungData) {
                const { price, preisReduktion } = veredelungData;

                // Add base Veredelung price
                let sideTotal = totalQuantity * parseFloat(price);
                let sidePricePerPiece = parseFloat(price); // Default price per piece

                // Check for discounts on Veredelung
                const applicableDiscount = preisReduktion.discounts.find(
                    (tier) =>
                        totalQuantity >= tier.minQuantity &&
                        (tier.maxQuantity === null || totalQuantity <= tier.maxQuantity)
                );

                if (applicableDiscount) {
                    const discountPercentage = applicableDiscount.discountPercentage / 100;
                    sidePricePerPiece = parseFloat(price) * (1 - discountPercentage); // Discounted price per piece
                    sideTotal = totalQuantity * sidePricePerPiece;
                }

                veredelungTotal += sideTotal;
                veredelungPerPiece[side] = sidePricePerPiece.toFixed(2); // Save price per piece for the side
            }
        }
    });

    // Apply discounts for the base product if discount data is provided
    if (discountData) {
        const applicableDiscount = discountData.find(
            (tier) =>
                totalQuantity >= tier.minQuantity && (tier.maxQuantity === null || totalQuantity <= tier.maxQuantity)
        );

        if (applicableDiscount) {
            appliedDiscountPercentage = applicableDiscount.discountPercentage; // Set applied discount percentage
            const discountPercentage = applicableDiscount.discountPercentage / 100;
            totalPrice = totalPrice * (1 - discountPercentage);

            setDiscountApplied(true);
        }
    } else {
        setDiscountApplied(false);
    }

    // Combine base product price and Veredelung price
    const finalPrice = totalPrice + veredelungTotal;

    return {
        totalPrice: finalPrice.toFixed(2),
        appliedDiscountPercentage,
        veredelungTotal: veredelungTotal.toFixed(2),
        veredelungPerPiece, // Include per-piece price for each Veredelung side
    };
};
