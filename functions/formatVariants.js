export default function formatVariants(variants) {
    // Determine available option names from the first variant.
    const optionNames = variants.edges[0]?.node.selectedOptions.map((opt) => opt.name) || [];

    // Choose primary and secondary option names.
    // Prefer "Größe" as primary if available, else first available;
    // Prefer "Farbe" as secondary if available, else second available, else default.
    const primaryName = optionNames.includes("Größe") ? "Größe" : optionNames[0] || "default";
    const secondaryName = optionNames.includes("Farbe") ? "Farbe" : optionNames[1] || "default";

    // Create a temporary map to store back images by secondary option value.
    const secondaryBackImages = {};

    // First pass: Build the structure.
    const structuredVariants = variants.edges.reduce((acc, { node }) => {
        // Dynamically extract the primary and secondary option values.
        const primaryValue = node.selectedOptions.find((opt) => opt.name === primaryName)?.value || "default";
        const secondaryValue = node.selectedOptions.find((opt) => opt.name === secondaryName)?.value || "default";

        const imageUrl = node.image?.originalSrc;
        const backImageUrl = node.backImageUrl || null;
        const configImageUrl = node.configImageUrl || (node.configImage && node.configImage.value) || null;
        const variantId = node.id;
        const price = node.priceV2?.amount || null;

        // If a back image exists, store it for the secondary option.
        if (backImageUrl) {
            secondaryBackImages[secondaryValue] = backImageUrl;
        }

        // Initialize the group for the primary value if needed.
        if (!acc[primaryValue]) {
            acc[primaryValue] = {
                // We keep the property name "colors" for compatibility with existing UI.
                colors: [],
            };
        }

        // Push the variant data into the appropriate group.
        acc[primaryValue].colors.push({
            // The secondary option value is stored in the "color" field.
            color: secondaryValue,
            image: imageUrl,
            backImage: backImageUrl || secondaryBackImages[secondaryValue] || null,
            configImage: configImageUrl,
            id: variantId,
            price,
            // Optionally, store all option values if needed later.
            options: node.selectedOptions.reduce((o, opt) => {
                o[opt.name] = opt.value;
                return o;
            }, {}),
        });

        return acc;
    }, {});

    // Second pass: For any variant that lacks a back image, use the stored one.
    Object.values(structuredVariants).forEach((primaryGroup) => {
        primaryGroup.colors.forEach((colorEntry) => {
            if (!colorEntry.backImage && secondaryBackImages[colorEntry.color]) {
                colorEntry.backImage = secondaryBackImages[colorEntry.color];
            }
        });
    });

    return structuredVariants;
}
