export default function generateVeredelungsPrice(veredelungData) {
    const basePrice = veredelungData.price; // Base price
    const title = veredelungData.title; // Title, e.g., "Veredelung Brust"
    const currency = veredelungData.currency || "EUR";

    // Initialize an array to hold the lines of output
    const output = [];

    // First line: Base price
    output.push(`Kosten ${title}: ${basePrice} ${currency}`);

    // Process each discount
    veredelungData.preisReduktion.discounts.forEach((discount) => {
        const minQty = discount.minQuantity;
        const maxQty = discount.maxQuantity;
        const price = discount.price;

        if (maxQty !== null) {
            output.push(`von ${minQty} - ${maxQty} Stk: ${price} ${currency}`);
        } else {
            output.push(`ab ${minQty} Stk: ${price} ${currency}`);
        }
    });

    return output;
}
