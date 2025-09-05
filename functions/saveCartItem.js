// utils/cartHelpers.js
import { v4 as uuidv4 } from "uuid";
import { calculateNetPrice } from "@/functions/calculateNetPrice";
import useStore from "@/store/store";
import { buildDecorationPatch, DECORATION_MODE } from "./decorations";

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

    // ⬇️ optionaler Schalter: perSide (Default) | perElement
    decorationMode = DECORATION_MODE.PER_SIDE,
}) {
    // 0) id wählen/erzeugen
    const itemId = isEditing && existingItemId ? existingItemId : uuidv4();

    // 1) PurchaseData kopieren & selectedVariant anheften
    const updated = { ...purchaseData, id: itemId, selectedVariant };
    const { sides } = updated;

    // 2) "Standard" aus Varianten entfernen
    const cleaned = { ...(updated.variants || {}) };
    if (cleaned.Standard) delete cleaned.Standard;

    // 3) totalQuantity (für Staffel)
    const totalQuantity = Object.values(cleaned).reduce((sum, v) => sum + (Number(v?.quantity) || 0), 0);

    // 4) Veredelungspatch bauen (JETZT zählen auch Texte)
    const { patch, perPiece, totalPerAll } = buildDecorationPatch({
        sides,
        veredelungen,
        totalQuantity,
        mode: decorationMode, // ← hier schaltest du um
        calculateNetPrice,
    });

    // 5) Varianten mergen & Zusatzinfos am Item speichern
    updated.variants = { ...cleaned, ...patch };
    updated.veredelungPerPiece = perPiece; // { front, back } – hilfreich für UI
    updated.veredelungTotal = totalPerAll; // Summe, falls du sie anzeigen willst
    updated.decorationMode = decorationMode;

    // 6) add or update
    if (isEditing && existingItemId) {
        updateCartItem(itemId, updated);
    } else {
        addCartItem(updated);
    }

    // 7) Blobs cachen (wie vorher)
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
