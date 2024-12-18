const prepareLineItems = (cartItems) => {
    const lineItems = [];

    cartItems.forEach((item) => {
        const { variants, profiDatenCheckPrice, sides, personalisierungsText } = item;

        // Add standard product variants
        if (variants) {
            Object.keys(variants).forEach((key) => {
                const variant = variants[key];

                if (variant.id && variant.quantity > 0) {
                    // Check if it's a veredelung and handle sides
                    const isVeredelung = key.toLowerCase().includes("veredelung");
                    let customAttributes = [{ key: "price", value: variant.price?.toFixed(2) || "0.00" }];

                    if (isVeredelung) {
                        const side = key.replace("Veredelung", "").toLowerCase();
                        const uploadedGraphic = sides?.[side]?.uploadedGraphic?.downloadURL;

                        if (uploadedGraphic) {
                            customAttributes.push({
                                key: `uploadedGraphic_${side}`,
                                value: uploadedGraphic,
                            });
                        }

                        customAttributes.push({
                            key: "title",
                            value: `Veredelung ${side}`,
                        });
                    }

                    // Add personalisierungsText as a custom attribute if it exists
                    if (personalisierungsText) {
                        customAttributes.push({
                            key: "personalisierungsText",
                            value: personalisierungsText,
                        });
                    }

                    // Avoid duplicate entries
                    if (!lineItems.find((item) => item.variantId === variant.id)) {
                        lineItems.push({
                            variantId: variant.id,
                            quantity: variant.quantity,
                            customAttributes,
                        });
                    }
                }
            });
        }

        // Add profiDatenCheck as a separate item
        if (item.profiDatenCheck && profiDatenCheckPrice > 0) {
            const profiDatenCheckVariant = variants.profiDatenCheck;

            if (profiDatenCheckVariant && profiDatenCheckVariant.id) {
                // Avoid duplicates for profiDatenCheck
                if (!lineItems.find((item) => item.variantId === profiDatenCheckVariant.id)) {
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
        }
    });

    console.log("Prepared Line Items:", lineItems);
    return lineItems;
};

export default prepareLineItems;
