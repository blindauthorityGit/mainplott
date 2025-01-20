export default function formatVariants(variants) {
    // Create a temporary map to store back images by color
    const colorBackImages = {};

    // First pass: Assign back images for colors
    const structuredVariants = variants.edges.reduce((acc, { node }) => {
        const sizeOption = node.selectedOptions.find((option) => option.name === "Größe")?.value;
        const colorOption = node.selectedOptions.find((option) => option.name === "Farbe")?.value;
        const imageUrl = node.image?.originalSrc;
        const backImageUrl = node.backImageUrl || null; // Include the back image URL if available
        const variantId = node.id; // Capture the variant ID
        const price = node.priceV2?.amount || null; // Capture the price amount

        // If this color already has a back image, use it; otherwise, store it
        if (backImageUrl) {
            colorBackImages[colorOption] = backImageUrl;
        }

        // If the size does not exist, add it
        if (!acc[sizeOption]) {
            acc[sizeOption] = {
                colors: [],
            };
        }

        // Add the variant to the structure
        acc[sizeOption].colors.push({
            color: colorOption,
            image: imageUrl,
            backImage: backImageUrl || colorBackImages[colorOption] || null, // Use the stored back image if not defined
            id: variantId, // Include the variant ID
            price,
        });

        return acc;
    }, {});

    // Second pass: Fill in missing back images for each size/color
    Object.values(structuredVariants).forEach((sizeGroup) => {
        sizeGroup.colors.forEach((colorEntry) => {
            if (!colorEntry.backImage && colorBackImages[colorEntry.color]) {
                colorEntry.backImage = colorBackImages[colorEntry.color];
            }
        });
    });

    console.log(structuredVariants);

    return structuredVariants;
}
