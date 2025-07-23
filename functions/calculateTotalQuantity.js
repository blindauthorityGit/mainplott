export default function calculateTotalQuantity(purchaseData) {
    const { variants } = purchaseData;
    if (!variants) return 0;

    const totalQuantity = Object.values(variants)
        // 1️⃣  erst alle falsy Einträge rauswerfen
        .filter(Boolean)
        // 2️⃣  nur echte Produkt-Varianten zählen
        .filter((v) => v.size || v.color)
        // 3️⃣  Menge addieren (v kann hier nicht mehr null sein)
        .reduce((sum, v) => sum + (v.quantity || 0), 0);

    return totalQuantity;
}
