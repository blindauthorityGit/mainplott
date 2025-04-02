// priceHelpers.js
import useUserStore from "@/store/userStore";

/**
 * Convert a NET per-piece price to the "final" per-piece price,
 * depending on user type (B2B => net, B2C => net * 1.19).
 *
 * @param {number} netPricePerPiece e.g. 1.15
 * @returns {number} final piece price for the user (B2C => 1.37, B2B => 1.15)
 */
export function getUserPiecePrice(netPricePerPiece) {
    const user = useUserStore.getState().user;
    const isB2B = user && user.userType === "firmenkunde";

    if (isB2B) {
        // Show net
        return netPricePerPiece;
    } else {
        // piecewise gross => multiply net * 1.19, round to 2 decimals
        return parseFloat((netPricePerPiece * 1.19).toFixed(2));
    }
}

/**
 * Multiply the user-specific per-piece price by quantity to get the final total.
 *
 * e.g. If B2C => (net * 1.19) * quantity,
 * or if B2B => net * quantity
 */
export function getUserTotalPrice(netPricePerPiece, quantity) {
    const piecePrice = getUserPiecePrice(netPricePerPiece);
    // multiply by quantity, round to 2 decimals
    return parseFloat((piecePrice * quantity).toFixed(2));
}
