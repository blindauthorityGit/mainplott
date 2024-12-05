export default function generateTableData(brustData, rueckenData) {
    const maxDiscountsLength = Math.max(
        brustData.preisReduktion.discounts.length,
        rueckenData?.preisReduktion?.discounts.length
    );

    const tableRows = [];
    for (let i = 0; i < maxDiscountsLength; i++) {
        const brustDiscount = brustData.preisReduktion.discounts[i] || {};
        const rueckenDiscount = rueckenData.preisReduktion.discounts[i] || {};

        tableRows.push({
            range: brustDiscount.maxQuantity
                ? `von ${brustDiscount.minQuantity} bis ${brustDiscount.maxQuantity}`
                : `ab ${brustDiscount.minQuantity}`,
            brustPrice: brustDiscount.price ? `${brustDiscount.price} ${brustData.currency}` : "-",
            rueckenPrice: rueckenDiscount.price ? `${rueckenDiscount.price} ${rueckenData.currency}` : "-",
        });
    }

    return tableRows;
}
