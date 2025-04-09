const prepareLineItems = (cartItems) => {
    const lineItems = [];
    console.log(cartItems);

    cartItems.forEach((item) => {
        const { variants, profiDatenCheckPrice, sides, personalisierungsText, layout } = item;
        // Assume that each cart item also contains the product object so we can check preisModell
        const isAllInclusive =
            item.product &&
            item.product.preisModell &&
            item.product.preisModell.value &&
            item.product.preisModell.value.includes("Alles inklusive");

        // Process normal product variants
        if (variants) {
            Object.keys(variants).forEach((key) => {
                const variant = variants[key];

                // Exclude items missing id, quantity <= 0, and extras.
                if (
                    !variant.id ||
                    !variant.quantity ||
                    variant.quantity <= 0 ||
                    key === "layoutService" ||
                    key === "profiDatenCheck"
                ) {
                    return;
                }

                // Check if veredelung line
                const isVeredelung = key.toLowerCase().includes("veredelung");
                // If product is "Alles inklusive", skip adding veredelung lines completely.
                if (isVeredelung && isAllInclusive) {
                    return;
                }

                // Build common customAttributes
                let customAttributes = [
                    {
                        key: "price",
                        value: variant.price ? parseFloat(variant.price).toFixed(2) : "0.00",
                    },
                ];

                if (isVeredelung) {
                    // Determine the side from the key (e.g., front or back)
                    const side = key.replace(/veredelung/i, "").toLowerCase();

                    // If there's an uploaded graphic for this side, add that info
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

                    // Handle additional attributes based on configurator mode
                    const isConfigurator = item.configurator !== "template";
                    customAttributes.push({
                        key: "Platzierung",
                        value: isConfigurator ? "Freie Platzierung" : "Fixe Position",
                    });

                    if (!isConfigurator) {
                        const pos = sides?.[side]?.position;
                        if (pos) {
                            customAttributes.push({
                                key: "Position",
                                value: pos,
                            });
                        }
                    } else {
                        const designURL = item.design?.[side]?.downloadURL;
                        if (designURL) {
                            customAttributes.push({
                                key: "Design",
                                value: designURL,
                            });
                        }
                    }
                }

                // Include personalisierungsText if it exists
                if (personalisierungsText) {
                    customAttributes.push({
                        key: "personalisierungsText",
                        value: personalisierungsText,
                    });
                }

                // Add the variant as one line item with its full quantity.
                // This version does not split quantities over 50.
                // Avoid duplicate entries by checking if a line with the same variantId is already added.
                if (!lineItems.find((li) => li.variantId === variant.id)) {
                    lineItems.push({
                        variantId: variant.id,
                        quantity: variant.quantity,
                        customAttributes,
                    });
                }
            });
        }

        // Process profiDatenCheck if chosen
        if (item.profiDatenCheck && profiDatenCheckPrice > 0) {
            const profiDatenCheckVariant = variants.profiDatenCheck;
            if (profiDatenCheckVariant && profiDatenCheckVariant.id) {
                if (!lineItems.find((li) => li.variantId === profiDatenCheckVariant.id)) {
                    lineItems.push({
                        variantId: profiDatenCheckVariant.id,
                        quantity: 1,
                        customAttributes: [
                            { key: "title", value: "Profi Datencheck" },
                            {
                                key: "price",
                                value: parseFloat(profiDatenCheckPrice).toFixed(2),
                            },
                        ],
                    });
                }
            }
        }

        // Process layoutService if chosen – and only add it if not all-inclusive.
        if (!isAllInclusive && variants?.layoutService && variants.layoutService.id) {
            const ls = variants.layoutService;
            if (ls.quantity > 0) {
                if (!lineItems.find((li) => li.variantId === ls.id)) {
                    let lsCustomAttributes = [
                        { key: "title", value: "LayoutService" },
                        { key: "price", value: parseFloat(ls.price).toFixed(2) },
                    ];

                    if (layout?.instructions) {
                        lsCustomAttributes.push({
                            key: "layoutInstructions",
                            value: layout.instructions,
                        });
                    }

                    if (layout?.uploadedFile?.downloadURL) {
                        lsCustomAttributes.push({
                            key: "layoutFile",
                            value: layout.uploadedFile.downloadURL,
                        });
                    }

                    lineItems.push({
                        variantId: ls.id,
                        quantity: ls.quantity,
                        customAttributes: lsCustomAttributes,
                    });
                }
            }
        }
    });

    return lineItems;
};

export default prepareLineItems;
