const prepareLineItems = (cartItems) => {
    const lineItems = [];

    cartItems.forEach((item) => {
        const { variants, profiDatenCheckPrice, sides, personalisierungsText, layout } = item;
        // layout might contain: { instructions, uploadedFile: {...} }

        // Normal product variants
        if (variants) {
            Object.keys(variants).forEach((key) => {
                const variant = variants[key];

                // Exclude layoutService & profiDatenCheck from the normal variant loop
                if (
                    !variant.id ||
                    !variant.quantity ||
                    variant.quantity <= 0 ||
                    key === "layoutService" ||
                    key === "profiDatenCheck"
                ) {
                    return;
                }

                // Check if veredelung
                const isVeredelung = key.toLowerCase().includes("veredelung");
                let customAttributes = [
                    {
                        key: "price",
                        value: variant.price ? parseFloat(variant.price).toFixed(2) : "0.00",
                    },
                ];

                if (isVeredelung) {
                    // Figure out if it's "front" or "back" from key
                    const side = key.replace(/veredelung/i, "").toLowerCase();

                    // If there's an uploaded graphic for this side
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

                    // If using the configurator
                    const isConfigurator = item.configurator !== "template";
                    customAttributes.push({
                        key: "Platzierung",
                        value: isConfigurator ? "Freie Platzierung" : "Fixe Position",
                    });

                    if (!isConfigurator) {
                        // Possibly add chosen position from sides?
                        const pos = sides?.[side]?.position;
                        if (pos) {
                            customAttributes.push({
                                key: "Position",
                                value: pos,
                            });
                        }
                    } else {
                        // Possibly add design if in configurator mode
                        const designURL = item.design?.[side]?.downloadURL;
                        if (designURL) {
                            customAttributes.push({
                                key: "Design",
                                value: designURL,
                            });
                        }
                    }
                }

                // personalisierungsText if it exists
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
            });
        }

        // 1) If profiDatenCheck is chosen
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

        // 2) If layoutService is chosen
        if (variants?.layoutService && variants.layoutService.id) {
            const ls = variants.layoutService;
            if (ls.quantity > 0) {
                // check if we already added it
                if (!lineItems.find((li) => li.variantId === ls.id)) {
                    // Build custom attributes for layout
                    let lsCustomAttributes = [
                        { key: "title", value: "LayoutService" },
                        { key: "price", value: parseFloat(ls.price).toFixed(2) },
                    ];

                    // If item.layout has instructions or an uploaded file
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
