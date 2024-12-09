const prepareLineItems = (cartItems) => {
    const lineItems = [];

    cartItems.forEach((item) => {
        const { variants, profiDatenCheckPrice, veredelungPerPiece } = item;

        // Process standard product variants
        if (variants) {
            Object.keys(variants).forEach((key) => {
                const variant = variants[key];

                if (variant.id && variant.quantity > 0) {
                    lineItems.push({
                        variantId: variant.id,
                        quantity: variant.quantity,
                        customAttributes: [{ key: "price", value: variant.price?.toFixed(2) || "0.00" }],
                    });
                }
            });
        }

        // Add profiDatenCheck as a separate item
        if (item.profiDatenCheck && profiDatenCheckPrice > 0) {
            const profiDatenCheckVariant = variants.profiDatenCheck;
            if (profiDatenCheckVariant && profiDatenCheckVariant.id) {
                lineItems.push({
                    variantId: profiDatenCheckVariant.id,
                    quantity: 1,
                    customAttributes: [
                        { key: "title", value: "Profi Datencheck" },
                        { key: "price", value: profiDatenCheckPrice.toFixed(2) },
                    ],
                });
            }
        }

        // Add veredelungen for each side
        if (veredelungPerPiece) {
            Object.keys(veredelungPerPiece).forEach((side) => {
                const veredelung = variants[`${side}Veredelung`];

                if (veredelung && veredelung.id) {
                    // Check if this veredelung is already in the line items
                    const existingLineItem = lineItems.find((lineItem) => lineItem.variantId === veredelung.id);

                    if (!existingLineItem) {
                        lineItems.push({
                            variantId: veredelung.id,
                            quantity: veredelung.quantity,
                            customAttributes: [
                                { key: "title", value: veredelung.title || `Veredelung ${side}` },
                                { key: "price", value: veredelung.price.toFixed(2) },
                            ],
                        });
                    }
                }
            });
        }
    });

    console.log("Prepared Line Items:", lineItems);

    return lineItems;
};

export default prepareLineItems;
