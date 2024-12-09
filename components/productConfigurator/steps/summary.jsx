import React from "react";
import useStore from "@/store/store"; // Zustand store
import { ListElement } from "@/components/list";
import { H2, H3, P } from "@/components/typography";

export default function OrderSummary() {
    const { purchaseData } = useStore();

    // Relevant data mapping for display
    const summaryData = [
        { label: "Produkt Name", value: purchaseData.productName },
        { label: "Farbe", value: purchaseData.selectedColor || "Nicht ausgewählt" },
        {
            label: "Design",
            value: `${Object.values(purchaseData.sides).filter((e) => e.uploadedGraphic).length} Motive (Seiten)`,
        },
        // { label: "Veredelungen", value: purchaseData.veredelungen || "Keine" },
        { label: "Profi Datencheck", value: purchaseData.profiDatenCheck ? "Ja" : "Nein" },
    ];

    // Extract sizes and quantities
    const sizeQuantityList = Object.entries(purchaseData.variants || {}).map(([size, variant]) => ({
        label: `Größe ${size}`,
        value: `${variant.quantity} Stück`,
    }));

    return (
        <div className="lg:px-16 lg:mt-8 font-body">
            <H2 klasse="mb-4">Zusammenfassung</H2>
            <div className="flex flex-col gap-1">
                {/* General Summary Data */}
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

                {/* Sizes and Quantities */}
                {sizeQuantityList.map((item, index) => (
                    <ListElement
                        width="!w-2/6"
                        key={`size-${index}`}
                        index={index + summaryData.length} // Offset index for unique keys
                        label={item.label}
                        description={item.label}
                        value={item.value}
                    />
                ))}
            </div>

            {/* Final Price */}
            <div className="mt-8">
                <P klasse="text-lg font-semibold mb-4">Gesamtpreis:</P>
                <H3 klasse="text-xl">EUR {purchaseData.totalPrice.toFixed(2)}</H3>
                <P klasse="!text-sm">
                    {purchaseData.veredelungTotal && `Davon EUR ${purchaseData.veredelungTotal} für Verdelungen`}
                </P>
                <P klasse="!text-sm">
                    {purchaseData.profiDatenCheck &&
                        `Davon EUR ${purchaseData.profiDatenCheckPrice}.00 für Profi DatenCheck`}
                </P>
            </div>
        </div>
    );
}
