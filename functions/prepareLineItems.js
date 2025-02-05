const prepareLineItems = (cartItems) => {
    const lineItems = [];

    cartItems.forEach((item) => {
        const { variants, profiDatenCheckPrice, sides, personalisierungsText } = item;

        // Determine if we are in configurator mode.
        // configurator is true if item.configurator is NOT "template"
        const isConfigurator = item.configurator !== "template";

        // Add standard product variants
        if (variants) {
            Object.keys(variants).forEach((key) => {
                const variant = variants[key];

                if (variant.id && variant.quantity > 0) {
                    // Check if it's a veredelung and handle sides
                    const isVeredelung = key.toLowerCase().includes("veredelung");
                    let customAttributes = [
                        {
                            key: "price",
                            // Safely parse variant.price before using toFixed
                            value: variant.price ? parseFloat(variant.price).toFixed(2) : "0.00",
                        },
                    ];

                    if (isVeredelung) {
                        // Determine the side from the key.
                        // For example: "frontVeredelung" becomes "front"
                        const side = key.replace(/veredelung/i, "").toLowerCase();

                        // (Optional) If there is an uploaded graphic for this side, add its URL
                        const uploadedGraphic = sides?.[side]?.uploadedGraphic?.downloadURL;
                        if (uploadedGraphic) {
                            customAttributes.push({
                                key: `uploadedGraphic_${side}`,
                                value: uploadedGraphic,
                            });
                        }

                        // Always include the title
                        customAttributes.push({
                            key: "title",
                            value: `Veredelung ${side}`,
                        });

                        // === NEW: Add custom attribute for placement ===
                        customAttributes.push({
                            key: "Platzierung",
                            value: isConfigurator ? "Freie Platzierung" : "Fixe Position",
                        });

                        if (!isConfigurator) {
                            // When not using the configurator, add an attribute for the chosen position.
                            const pos = sides?.[side]?.position;
                            if (pos) {
                                customAttributes.push({
                                    key: "Position",
                                    value: pos,
                                });
                            }
                        } else {
                            // When using the configurator, also add the design attribute (if available).
                            const designURL = item.design?.[side]?.downloadURL;
                            if (designURL) {
                                customAttributes.push({
                                    key: "Design",
                                    value: designURL,
                                });
                            }
                        }
                    }

                    // Add personalisierungsText as a custom attribute if it exists
                    if (personalisierungsText) {
                        customAttributes.push({
                            key: "personalisierungsText",
                            value: personalisierungsText,
                        });
                    }

                    // Avoid duplicates
                    if (!lineItems.find((li) => li.variantId === variant.id)) {
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
                if (!lineItems.find((li) => li.variantId === profiDatenCheckVariant.id)) {
                    lineItems.push({
                        variantId: profiDatenCheckVariant.id,
                        quantity: 1,
                        customAttributes: [
                            { key: "title", value: "Profi Datencheck" },
                            {
                                key: "price",
                                // Safely parse profiDatenCheckPrice
                                value: parseFloat(profiDatenCheckPrice).toFixed(2),
                            },
                        ],
                    });
                }
            }
        }
    });

    return lineItems;
};

export default prepareLineItems;
