import codes from "@/libs/couponCodes";

function getDiscountCodeFromCart(cartItems) {
    for (const codeEntry of codes) {
        for (const item of cartItems) {
            const handle = item?.productHandle || item?.handle;
            const quantity = item.quantity;
            console.log(item.product.handle, quantity);

            if (
                codeEntry.productHandles.includes(handle) &&
                quantity >= codeEntry.minQuantity &&
                (codeEntry.maxQuantity === null || quantity <= codeEntry.maxQuantity)
            ) {
                return codeEntry.code;
            }
        }
    }

    return null; // Kein passender Rabattcode gefunden
}

export default getDiscountCodeFromCart;
