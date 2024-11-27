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

export const calculateTotalPrice = (variants, product, discountData, setDiscountApplied) => {
    let totalQuantity = 0;
    let totalPrice = 0;
    let appliedDiscountPercentage = 0; // Track applied discount percentage

    // Calculate total price and total quantity
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

    // Apply discounts if discount data is provided
    if (discountData) {
        const applicableDiscount = discountData.find(
            (tier) =>
                totalQuantity >= tier.minQuantity && (tier.maxQuantity === null || totalQuantity <= tier.maxQuantity)
        );

        if (applicableDiscount) {
            appliedDiscountPercentage = applicableDiscount.discountPercentage; // Set applied discount percentage
            const discountPercentage = applicableDiscount.discountPercentage / 100;
            const discountedPrice = totalPrice * (1 - discountPercentage);

            // Flag discount state
            setDiscountApplied(true);
            return { totalPrice: discountedPrice.toFixed(2), appliedDiscountPercentage };
        }
    }

    // No discount applied
    setDiscountApplied(false);
    return { totalPrice: totalPrice.toFixed(2), appliedDiscountPercentage: 0 };
};
