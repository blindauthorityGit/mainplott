export default function calculateLowestPrice(variants) {
    // Ensure variants is a valid array
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
        return "Preis auf Anfrage";
    }

    // Extract and validate prices
    const prices = variants
        .map((variant) => {
            const price = variant.node?.priceV2?.amount; // Safely access priceV2.amount
            return price ? parseFloat(price) : null; // Convert to float or return null
        })
        .filter((price) => price !== null && !isNaN(price)); // Filter out null or invalid prices

    // Handle cases where no valid prices are found
    if (prices.length === 0) {
        return "Preis auf Anfrage";
    }

    // Find the lowest price
    const lowestPrice = Math.min(...prices);

    // Return the formatted result
    return `ab EUR ${lowestPrice.toFixed(2).replace(".", ",")}`;
}
