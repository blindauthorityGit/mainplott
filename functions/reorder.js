// /functions/reorder.js
import { v4 as uuidv4 } from "uuid";
import { getProductByHandle } from "@/libs/shopify"; // <- dein shopify.js
import useStore from "@/store/store";

/**
 * Vollprodukt nachladen und minimal sicherstellen,
 * dass shape (images.edges etc.) vorhanden ist.
 */
export async function hydrateProductByHandle(handle) {
    const data = await getProductByHandle(handle);
    const product = data?.product;
    if (!product) return null;

    // safety: edges-Arrays garantieren
    product.images = product.images || { edges: [] };
    product.variants = product.variants || { edges: [] };

    // kleines Lookup (Size -> Variant)
    const variantBySize = {};
    product.variants.edges.forEach(({ node }) => {
        const size = node.selectedOptions?.find((o) => o.name === "Größe")?.value;
        if (size) variantBySize[size] = node;
    });

    return { product, variantBySize, meta: data };
}

/**
 * snapshot (aus Firestore pending) -> purchaseData,
 * so wie dein Konfigurator es erwartet.
 */
export function snapshotToPurchaseData(snapshot, product, variantBySize) {
    const sides = snapshot?.sides || {};
    const variants = snapshot?.variants || {};
    const currentSide = snapshot?.currentSide || "front";

    // Variants in dein "formattedVariants" Schema bringen
    const formattedVariants = {};
    Object.entries(variants).forEach(([label, info]) => {
        if (!info || typeof info !== "object") return;
        const qty = Number(info.quantity || 0);
        if (!qty) return;
        const unit = Number(info.price || 0);
        formattedVariants[label] = {
            id: variantBySize[label]?.id || null,
            price: unit,
            quantity: qty,
        };
    });

    // Summary-Previews (falls vorhanden)
    const frontPreview = sides?.front?.images?.find((i) => i?.name === "designPreview")?.url || null;
    const backPreview = sides?.back?.images?.find((i) => i?.name === "designPreview")?.url || null;

    // Veredelungsschätzer aus snapshot (falls du’s benutzt)
    const veredelungPerPiece = {
        front: Number(variants?.frontVeredelung?.price || 0),
        back: Number(variants?.backVeredelung?.price || 0),
    };
    const veredelungTotal =
        Number(variants?.frontVeredelung?.quantity || 0) * veredelungPerPiece.front +
        Number(variants?.backVeredelung?.quantity || 0) * veredelungPerPiece.back;

    // total
    const totalPrice =
        typeof snapshot.totalPrice === "number"
            ? snapshot.totalPrice
            : Object.values(variants).reduce((s, v) => s + Number(v?.price || 0) * Number(v?.quantity || 0), 0) +
              veredelungTotal;

    // Compose purchaseData wie dein Store es kennt
    const purchaseData = {
        id: snapshot.id || uuidv4(),
        configurator: "config", // dein Store erwartet z.T. diesen Wert
        currentSide,
        containerWidth: snapshot.containerWidth || 676,
        containerHeight: snapshot.containerHeight || 740,
        decorationMode: snapshot.decorationMode || "permSide",

        // Design / Sides in dein Schema
        design: {
            front: frontPreview ? { downloadURL: frontPreview } : {},
            back: backPreview ? { downloadURL: backPreview } : {},
        },
        sides: {
            front: {
                uploadedGraphics: (sides?.front?.images || [])
                    .filter((i) => i?.type === "upload")
                    .map((i, idx) => ({
                        id: i.id || `f-${idx}`,
                        file: null, // bei Reorder i.d.R. null; kannst Blob nachladen falls nötig
                        downloadURL: i.url || null,
                        xPosition: i.x ?? 0,
                        yPosition: i.y ?? 0,
                        scale: i.scale ?? 1,
                        rotation: i.rotation ?? 0,
                        width: i.width || 0,
                        height: i.height || 0,
                    })),
                texts: sides?.front?.texts || [],
                activeGraphicId: null,
                activeTextId: null,
            },
            back: {
                uploadedGraphics: (sides?.back?.images || [])
                    .filter((i) => i?.type === "upload")
                    .map((i, idx) => ({
                        id: i.id || `b-${idx}`,
                        file: null,
                        downloadURL: i.url || null,
                        xPosition: i.x ?? 0,
                        yPosition: i.y ?? 0,
                        scale: i.scale ?? 1,
                        rotation: i.rotation ?? 0,
                        width: i.width || 0,
                        height: i.height || 0,
                    })),
                texts: sides?.back?.texts || [],
                activeGraphicId: null,
                activeTextId: null,
            },
        },

        // Produkt + Pricing
        product: {
            handle: snapshot.productHandle || product.handle,
            title: snapshot.productTitle || product.title,
            images: product.images, // wichtig fürs UI
            // convenience:
            _full: product,
        },
        productName: snapshot.productTitle || product.title,
        selectedColor: snapshot.selectedColor || null,
        selectedSize: snapshot.selectedSize || null,

        formattedVariants, // dein Konfigurator liest das in den Staffellungen
        variants, // Rohdaten behalten (falls alte Stellen noch darauf zugreifen)

        veredelungenPerPiece: veredelungPerPiece,
        veredelungTotal,
        price: totalPrice,
        totalPrice,
        quantity: Object.values(variants).reduce((s, v) => s + Number(v?.quantity || 0), 0) || 1,

        // Flags aus deinem Store
        isLayout: !!snapshot.isLayout,
        profiDatenCheck: !!snapshot.profiDatenCheck,
        personalisierung: snapshot.personalisierung ?? null,
        _src: "pending",
        _snapshot: snapshot,
    };

    // selectedVariantId sauber setzen, falls selectedSize vorhanden
    if (purchaseData.selectedSize && variantBySize[purchaseData.selectedSize]) {
        purchaseData.selectedVariantId = variantBySize[purchaseData.selectedSize].id;
    }

    return purchaseData;
}

/**
 * Pending-Entry -> „richtiges“ Cart-Item (wie im Live-Prozess),
 * inkl. vollem Produkt, Previews etc.
 */
export async function entryToCartItem(entry) {
    const snap = entry?.items?.[0]?.snapshot || null;
    if (!snap) return null;

    const { product, variantBySize } = await hydrateProductByHandle(snap.productHandle || snap.product?.handle);
    if (!product) return null;

    const purchaseData = snapshotToPurchaseData(snap, product, variantBySize);

    // Das Cart-Item entspricht bei dir i.d.R. einfach purchaseData + id
    return {
        ...purchaseData,
        id: entry.items?.[0]?.id || entry.id || uuidv4(),
    };
}

/**
 * Mehrere pending Items -> Cart füllen & Sidebar öffnen
 */
export async function reorderPendingEntry(entry) {
    const item = await entryToCartItem(entry);
    if (!item) {
        alert("Diese Bestellung konnte nicht rekonstruiert werden.");
        return;
    }
    const { openCartSidebar, replaceCartItems } = useStore.getState();
    replaceCartItems([item]);
    openCartSidebar();
}

/**
 * Direkt in den Editor springen (optional).
 * Achtung: du brauchst auf /products/[handle] eine Logik, die
 * ?editIndex liest und purchaseData aus cartItems[editIndex] in den
 * lokalen Store schiebt (setPurchaseData).
 */
export async function editPendingEntry(entry, editIndex = 0) {
    const item = await entryToCartItem(entry);
    if (!item) return;

    const { replaceCartItems } = useStore.getState();
    replaceCartItems([item]);
    const handle = item.product?.handle;
    if (handle) {
        const url = `/products/${handle}?editIndex=${editIndex}`;
        window.location.assign(url);
    }
}
