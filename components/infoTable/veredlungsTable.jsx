import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import generateTableData from "@/functions/generateTableData";
import { P } from "@/components/typography";

const EXTRA_PRICE_PER_MOTIF = 3.5; // hard-coded extra charge (exkl. MwSt.)

function VeredelungTable({ brustData, rueckenData }) {
    const tableRows = generateTableData(brustData, rueckenData);

    function formatPriceString(priceStr) {
        const numericPart = String(priceStr || "")
            .replace("EUR", "")
            .trim();
        const value = parseFloat(numericPart || 0);
        return `${value.toFixed(2)} EUR`;
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
                {tableRows.map((row, index) => (
                    <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">{row.range}</td>
                        <td className="border border-gray-300 px-4 py-2">{formatPriceString(row.brustPrice)}</td>
                        <td className="border border-gray-300 px-4 py-2">{formatPriceString(row.rueckenPrice)}</td>
                    </tr>
                ))}
            </tbody>

            <tfoot>
                <tr>
                    <td
                        colSpan={3}
                        className="border border-gray-300 px-4 py-2 bg-gray-50 text-[11px] italic text-gray-700"
                    >
                        Zusätzliche Grafiken / Texte pro verfügbarer Seite werden mit{" "}
                        <span className="font-semibold">EUR {EXTRA_PRICE_PER_MOTIF.toFixed(2)}</span> extra verrechnet
                        (exkl. MwSt.).
                    </td>
                </tr>
            </tfoot>
        </table>
    );
}

export default function CollapsibleVeredelungTable({ brustData, rueckenData }) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    return (
        <div className="w-full rounded-lg border bg-white overflow-hidden">
            <div className="flex justify-between items-center p-4 cursor-pointer" onClick={toggleCollapse}>
                <P className="font-body text-sm 2xl:text-sm font-semibold">
                    Kostenaufstellung Veredelungen exkl. MwSt.
                </P>
                <div className="text-xl">{isCollapsed ? <FiChevronDown /> : <FiChevronUp />}</div>
            </div>

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
