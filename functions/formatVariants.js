// libs/formatVariants.js

export default function formatVariants(variants) {
    // Reduce the variants into a structured format
    return variants.edges.reduce((acc, { node }) => {
        const sizeOption = node.selectedOptions.find((option) => option.name === "Größe")?.value;
        const colorOption = node.selectedOptions.find((option) => option.name === "Farbe")?.value;
        const imageUrl = node.image?.originalSrc;
        const backImageUrl = node.backImageUrl || null; // Include the back image URL if available
        const variantId = node.id; // Capture the variant ID

        // If the size does not exist, add it
        if (!acc[sizeOption]) {
            acc[sizeOption] = {
                colors: [],
            };
        }

        // Add the color, front image, back image, and variant ID if not already present
        acc[sizeOption].colors.push({
            color: colorOption,
            image: imageUrl,
            backImage: backImageUrl,
            id: variantId, // Include the variant ID
        });

        return acc;
    }, {});
}
