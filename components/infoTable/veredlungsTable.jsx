import React from "react";

import generateTableData from "@/functions/generateTableData";

function VeredelungTable({ brustData, rueckenData }) {
    const tableRows = generateTableData(brustData, rueckenData);

    console.log(tableRows);
    function formatPriceString(priceStr) {
        // Example input: "7.7 EUR" or "5 EUR"
        // Remove "EUR" and trim
        const numericPart = priceStr.replace("EUR", "").trim();
        const value = parseFloat(numericPart);
        // Format to two decimals
        const formattedValue = value.toFixed(2);
        // Add " EUR" back
        return `${formattedValue} EUR`;
    }

    return (
        <table className="table-auto text-xs border-collapse border border-gray-300 w-full text-left font-body">
            <thead>
                <tr>
                    <th className="border border-gray-300 px-4 py-2">Stk-Bereich</th>
                    <th className="border border-gray-300 px-4 py-2">Brust</th>
                    <th className="border border-gray-300 px-4 py-2">Rücken</th>
                </tr>
            </thead>
            <tbody>
                {/* Base Prices */}
                <tr>
                    <td className="border border-gray-300 px-4 py-2">Preis</td>
                    <td className="border border-gray-300 px-4 py-2">
                        {Number(brustData.price).toFixed(2)} {brustData.currency}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                        {Number(rueckenData.price).toFixed(2)} {rueckenData.currency}
                    </td>
                </tr>

                {/* Discount Prices */}
                {tableRows.map((row, index) => (
                    <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">{row.range}</td>
                        <td className="border border-gray-300 px-4 py-2">{formatPriceString(row.brustPrice)}</td>
                        <td className="border border-gray-300 px-4 py-2">{formatPriceString(row.rueckenPrice)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default VeredelungTable;
