// utils/cartHelpers.js
import { v4 as uuidv4 } from "uuid";
import { calculateNetPrice } from "@/functions/calculateNetPrice";
import useStore from "@/store/store";

/**
 * Staffel-Preis Logic + add/update cart item
 */
export function saveCartItem({
    purchaseData,
    veredelungen,
    addCartItem,
    selectedVariant,
    updateCartItem,
    openCartSidebar,
    hideMobileSteps,
    isEditing,
    existingItemId,
}) {
    // 0) Pick or generate your final itemId
    const itemId = isEditing && existingItemId ? existingItemId : uuidv4();

    // 1) shallow-copy purchaseData & force our itemId onto it
    const updated = { ...purchaseData, id: itemId, selectedVariant };
    const { sides, variants } = updated;

    // 2) remove the “Standard” variant if present
    const cleaned = { ...variants };
    if (cleaned.Standard) delete cleaned.Standard;

    // 3) compute totalQuantity
    const totalQuantity = Object.values(cleaned).reduce((sum, v) => sum + (v.quantity || 0), 0);

    // 4) apply price-tiers for front/back
    ["front", "back"].forEach((sideKey) => {
        const side = sides?.[sideKey];
        if (!side || (!side.uploadedGraphic && !side.uploadedGraphicFile)) return;
        const detail = veredelungen?.[sideKey];
        if (!detail) return;

        const match = detail.preisReduktion.discounts.find(
            (d) => totalQuantity >= d.minQuantity && (d.maxQuantity == null || totalQuantity <= d.maxQuantity)
        );
        if (!match) return;

        const idx = detail.preisReduktion.discounts.indexOf(match);
        const sel = detail.variants.edges[idx];
        if (!sel) return;

        cleaned[`${sideKey}Veredelung`] = {
            id: sel.node.id,
            size: null,
            quantity: totalQuantity,
            price: calculateNetPrice(parseFloat(match.price)),
            title: detail.title + " " + sideKey.charAt(0).toUpperCase() + sideKey.slice(1),
            currency: detail.currency,
        };
    });

    updated.variants = cleaned;

    // 5) add or update cart item
    if (isEditing && existingItemId) {
        updateCartItem(itemId, updated);
    } else {
        addCartItem(updated);
    }

    // 6) cache each side’s blob under exactly the same key
    const { cacheBlob } = useStore.getState();
    ["front", "back"].forEach((sideKey) => {
        const blob = updated.sides?.[sideKey]?.uploadedGraphicFile;
        if (blob instanceof Blob) {
            cacheBlob(`${itemId}:${sideKey}`, blob);
        }
    });

    // debug
    console.log("FULL BLOB CACHE:", useStore.getState().blobCache);

    openCartSidebar();
    hideMobileSteps();
}
