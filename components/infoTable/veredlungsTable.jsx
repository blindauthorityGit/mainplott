import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi"; // Import icons for the arrow

import generateTableData from "@/functions/generateTableData";
import { P } from "@/components/typography";
function VeredelungTable({ brustData, rueckenData }) {
    const tableRows = generateTableData(brustData, rueckenData);

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
                {/* <tr>
                    <td className="border border-gray-300 px-4 py-2">Preis</td>
                    <td className="border border-gray-300 px-4 py-2">
                        {Number(brustData.price).toFixed(2)} {brustData.currency}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                        {Number(rueckenData.price).toFixed(2)} {rueckenData.currency}
                    </td>
                </tr> */}

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

export default function CollapsibleVeredelungTable({ brustData, rueckenData }) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    // Toggle collapse state
    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="w-full rounded-lg border bg-white  overflow-hidden">
            <div className="flex justify-between items-center p-4 cursor-pointer" onClick={toggleCollapse}>
                <P className="font-body text-sm 2xl:text-lg font-semibold">
                    Kostenaufstellung Veredelungen exkl. MwSt.
                </P>
                <div className="text-xl">{isCollapsed ? <FiChevronDown /> : <FiChevronUp />}</div>
            </div>

            {/* Collapsible content */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isCollapsed ? "max-h-0" : "max-h-96"
                }`}
            >
                <div className="p-4">
                    <VeredelungTable brustData={brustData} rueckenData={rueckenData} />
                </div>
            </div>
        </div>
    );
}
