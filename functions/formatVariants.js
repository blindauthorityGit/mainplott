// functions/formatVariants.js
export default function formatVariants(variantsInput) {
    // 1) Normalisieren: wir arbeiten mit einer reinen Node-Liste
    const nodes = Array.isArray(variantsInput?.edges)
        ? variantsInput.edges.map((e) => e?.node).filter(Boolean)
        : Array.isArray(variantsInput)
        ? variantsInput.filter(Boolean)
        : [];

    // Nichts da? -> leere Struktur zurück
    if (nodes.length === 0) {
        return { default: { colors: [] } };
    }

    // 2) Option-Namen aus der ersten Variante ziehen (falls vorhanden)
    const firstSelected = nodes[0]?.selectedOptions || [];
    const optionNames = firstSelected.map((opt) => opt?.name).filter(Boolean);

    // bevorzugt "Größe" / "Farbe", sonst erste/zweite Option, sonst "default"
    const primaryName = optionNames.includes("Größe") ? "Größe" : optionNames[0] ?? "default";
    const secondaryName = optionNames.includes("Farbe") ? "Farbe" : optionNames[1] ?? "default";

    // 3) Back-Images pro Secondary-Option merken
    const secondaryBackImages = {};

    // 4) Struktur aufbauen
    const structured = nodes.reduce((acc, node) => {
        const selected = node?.selectedOptions || [];
        const primaryValue = selected.find((o) => o?.name === primaryName)?.value ?? "default";
        const secondaryValue = selected.find((o) => o?.name === secondaryName)?.value ?? "default";

        const imageUrl = node?.image?.originalSrc ?? node?.image?.src ?? null;
        const backImageUrl = node?.backImageUrl || null;
        const configImageUrl = node?.configImageUrl || (node?.configImage && node.configImage.value) || null;
        const variantId = node?.id;
        const price = node?.priceV2?.amount ?? node?.price?.amount ?? null;

        if (backImageUrl) {
            secondaryBackImages[secondaryValue] = backImageUrl;
        }

        if (!acc[primaryValue]) {
            acc[primaryValue] = { colors: [] };
        }

        acc[primaryValue].colors.push({
            color: secondaryValue,
            image: imageUrl,
            backImage: backImageUrl || secondaryBackImages[secondaryValue] || null,
            configImage: configImageUrl,
            id: variantId,
            price,
            options: selected.reduce((o, opt) => {
                if (opt?.name) o[opt.name] = opt?.value;
                return o;
            }, {}),
        });

        return acc;
    }, {});

    // 5) Back-Image Fallbacks nachtragen
    Object.values(structured).forEach((group) => {
        group.colors.forEach((c) => {
            if (!c.backImage && secondaryBackImages[c.color]) {
                c.backImage = secondaryBackImages[c.color];
            }
        });
    });

    return structured;
}
