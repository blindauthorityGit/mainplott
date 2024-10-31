// libs/formatVariants.js

export default function formatVariants(variants) {
    // Reduziere die Varianten in ein strukturiertes Format
    return variants.edges.reduce((acc, { node }) => {
        const sizeOption = node.selectedOptions.find((option) => option.name === "Größe").value;
        const colorOption = node.selectedOptions.find((option) => option.name === "Farbe").value;
        const imageUrl = node.image?.originalSrc;

        // Wenn die Größe noch nicht existiert, füge sie hinzu
        if (!acc[sizeOption]) {
            acc[sizeOption] = {
                colors: [],
            };
        }

        // Farbe und Bild hinzufügen, falls noch nicht vorhanden
        acc[sizeOption].colors.push({ color: colorOption, image: imageUrl });

        return acc;
    }, {});
}
