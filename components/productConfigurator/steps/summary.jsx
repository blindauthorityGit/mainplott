import React, { useState, useEffect, useMemo } from "react";
import useStore from "@/store/store";
import { ListElement } from "@/components/list";
import { H2, H3, P } from "@/components/typography";
import { calculateNetPrice } from "@/functions/calculateNetPrice";
import { getDecorationSummary } from "@/functions/decorationMode";

export default function OrderSummary({ product }) {
    const { purchaseData } = useStore();
    const [allInclusive, setAllInclusive] = useState(false);

    const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
    const deco = getDecorationSummary(purchaseData);

    // ---- Helper: Motive & Zusatzveredelungen zählen ----
    const counts = useMemo(() => {
        const side = (key) => purchaseData?.sides?.[key] || {};
        const getSideTotals = (s) => {
            const texts = Array.isArray(s.texts) ? s.texts.length : 0;
            const graphics = Array.isArray(s.uploadedGraphics) ? s.uploadedGraphics.length : 0;
            const total = texts + graphics;
            const extra = Math.max(0, total - 1); // 1 Motiv pro Seite inklusive, Rest = Zusatz
            return { total, extra };
        };

        const f = getSideTotals(side("front"));
        const b = getSideTotals(side("back"));

        const stored = purchaseData?.extraDecorations;
        const frontExtra = typeof stored?.front === "number" ? stored.front : f.extra;
        const backExtra = typeof stored?.back === "number" ? stored.back : b.extra;

        return {
            frontTotal: f.total,
            backTotal: b.total,
            total: f.total + b.total,
            frontExtra,
            backExtra,
            extraTotal: frontExtra + backExtra,
            sidesWithContent: deco.sidesWithContent,
        };
    }, [purchaseData, deco.sidesWithContent]);

    // zusammengesetzter Text für die Design-Zeile
    const designValue = (() => {
        if (counts.total === 0) return "Keine Motive";
        // Beispiel: "3 Motive (Front 2, Rücken 1) – davon 1 Zusatz"
        const sidePart = [
            counts.frontTotal ? `Front ${counts.frontTotal}` : null,
            counts.backTotal ? `Rücken ${counts.backTotal}` : null,
        ]
            .filter(Boolean)
            .join(", ");
        const extraPart = counts.extraTotal > 0 ? ` – davon ${counts.extraTotal} Zusatz` : "";
        return `${counts.total} Motive (${sidePart})${extraPart}`;
    })();

    // Summary rows
    const summaryData = [
        { label: "Produkt Name", value: purchaseData.productName },
        { label: "Farbe", value: purchaseData.selectedColor || "Nicht ausgewählt" },
        { label: "Design", value: designValue },
        { label: "Profi Datencheck", value: purchaseData.profiDatenCheck ? "Ja" : "Nein" },
        { label: "Layout Service", value: purchaseData.layoutServiceSelected ? "Ja" : "Nein" },
    ];

    // Preis-Modell ermitteln
    useEffect(() => {
        if (product?.preisModell?.value) {
            const preisModellArray = JSON.parse(product.preisModell.value);
            setAllInclusive(preisModellArray.includes("Alles inklusive"));
        } else {
            setAllInclusive(false);
        }
    }, [product.preisModell]);

    // Größen & Mengen
    const sizeQuantityList = Object.entries(purchaseData.variants || {})
        .filter(([size]) => size.toUpperCase() !== "STANDARD")
        .map(([size, variant]) => ({ label: `Variante ${size}`, value: `${variant.quantity} Stück`, size }))
        .sort((a, b) => {
            const ai = sizeOrder.indexOf(a.size.toUpperCase());
            const bi = sizeOrder.indexOf(b.size.toUpperCase());
            if (ai === -1 && bi === -1) return a.size.localeCompare(b.size);
            if (ai === -1) return 1;
            if (bi === -1) return -1;
            return ai - bi;
        });

    return (
        <div className="lg:px-16 lg:mt-8 font-body">
            <H2 klasse="mb-4 text-textColor">Zusammenfassung</H2>

            <div className="flex flex-col gap-1">
                {summaryData.map((item, index) => (
                    <ListElement
                        width="!w-2/6"
                        key={index}
                        index={index}
                        label={item.label}
                        description={item.label}
                        value={item.value}
                    />
                ))}

                {sizeQuantityList.map((item, index) =>
                    item.value.split("")[0] == 0 || item.label.split(" ")[1] == "profiDatenCheck" ? null : (
                        <ListElement
                            width="!w-2/6"
                            key={`size-${index}`}
                            index={index + summaryData.length}
                            label={item.label}
                            description={item.label}
                            value={item.value}
                        />
                    )
                )}
            </div>

            {/* Gesamtpreis */}
            <div className="mt-8">
                <P klasse="text-lg font-semibold mb-4">Gesamtpreis:</P>
                <H3 klasse="lg:text-xl">EUR {Number(purchaseData.totalPrice).toFixed(2)}</H3>
                {/* Beispiel für Nettotext (optional):
        <P klasse="!text-sm text-gray-600">Netto: EUR {calculateNetPrice(Number(purchaseData.totalPrice).toFixed(2))}</P>
        */}
            </div>
        </div>
    );
}
