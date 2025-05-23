const prepareLineItems = (cartItems) => {
    const lineItems = [];

    cartItems.forEach((item, itemIndex) => {
        const { variants, profiDatenCheckPrice, sides, personalisierungsText, layout, design, configurator, product } =
            item;

        const isAllInclusive =
            Boolean(product?.preisModell?.value) && product.preisModell.value.includes("Alles inklusive");

        // 1) Size-/Color-Varianten & ggf. Veredelungen
        Object.entries(variants).forEach(([key, variant]) => {
            if (!variant.id || variant.quantity <= 0 || key === "layoutService" || key === "profiDatenCheck") {
                return;
            }

            const isVeredelung = /veredelung/i.test(key);
            if (isVeredelung && isAllInclusive) {
                // skip Veredelungen bei All-Inclusive
                return;
            }

            // Basis-Attribute für jede Zeile
            const customAttributes = [
                { key: "price", value: parseFloat(variant.price || 0).toFixed(2) },
                { key: "itemIndex", value: String(itemIndex) },
            ];

            if (isVeredelung) {
                // Beispiel key="frontVeredelung" → side="front"
                const side = key.replace(/Veredelung/i, "").toLowerCase();

                customAttributes.push(
                    { key: "title", value: `Veredelung ${side}` },
                    {
                        key: "Platzierung",
                        value: configurator !== "template" ? "Freie Platzierung" : "Fixe Position",
                    }
                );

                // hochgeladene Grafik
                const uploaded = sides?.[side]?.uploadedGraphic?.downloadURL;
                if (uploaded) {
                    customAttributes.push({
                        key: `uploadedGraphic_${side}`,
                        value: uploaded,
                    });
                }
                // exportiertes Design
                const designURL = design?.[side]?.downloadURL;
                if (designURL) {
                    customAttributes.push({
                        key: `designURL_${side}`,
                        value: designURL,
                    });
                }
            } else {
                // normale Size/Color-Variante
                customAttributes.push({
                    key: "title",
                    value: variant.size ? `Variante ${variant.size}` : `Variant ${key}`,
                });

                // wenn All-Inclusive, hängen wir hier die hochgeladenen Grafiken & Designs an
                if (isAllInclusive) {
                    Object.keys(sides).forEach((side) => {
                        const uploaded = sides[side]?.uploadedGraphic?.downloadURL;
                        if (uploaded) {
                            customAttributes.push({
                                key: `uploadedGraphic_${side}`,
                                value: uploaded,
                            });
                        }
                        const designURL = design?.[side]?.downloadURL;
                        if (designURL) {
                            customAttributes.push({
                                key: `designURL_${side}`,
                                value: designURL,
                            });
                        }
                    });
                }
            }

            if (personalisierungsText) {
                customAttributes.push({
                    key: "personalisierungsText",
                    value: personalisierungsText,
                });
            }

            lineItems.push({
                variantId: variant.id,
                quantity: variant.quantity,
                customAttributes,
            });
        });

        // 2) Profi Datencheck
        if (item.profiDatenCheck && profiDatenCheckPrice > 0) {
            const p = variants.profiDatenCheck;
            if (p?.id) {
                lineItems.push({
                    variantId: p.id,
                    quantity: 1,
                    customAttributes: [
                        { key: "title", value: "Profi Datencheck" },
                        { key: "price", value: parseFloat(profiDatenCheckPrice).toFixed(2) },
                        { key: "itemIndex", value: String(itemIndex) },
                    ],
                });
            }
        }

        // 3) Layout Service
        if (!isAllInclusive && variants.layoutService?.id && variants.layoutService.quantity > 0) {
            const ls = variants.layoutService;
            const attrs = [
                { key: "title", value: "LayoutService" },
                { key: "price", value: parseFloat(ls.price).toFixed(2) },
                { key: "itemIndex", value: String(itemIndex) },
            ];
            if (layout?.instructions) {
                attrs.push({
                    key: "layoutInstructions",
                    value: layout.instructions,
                });
            }
            if (layout?.uploadedFile?.downloadURL) {
                attrs.push({
                    key: "layoutFile",
                    value: layout.uploadedFile.downloadURL,
                });
            }
            lineItems.push({
                variantId: ls.id,
                quantity: ls.quantity,
                customAttributes: attrs,
            });
        }
    });

    return lineItems;
};

export default prepareLineItems;
