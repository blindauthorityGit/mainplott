import React from "react";
import useStore from "@/store/store"; // Zustand store
import { ListElement } from "@/components/list";
import { H2, H3, P } from "@/components/typography";

export default function OrderSummary() {
    const { purchaseData, totalPrice } = useStore();

    // Relevant data mapping for display
    const summaryData = [
        { label: "Produkt Name", value: purchaseData.productName },
        { label: "Größe", value: purchaseData.selectedSize || "Nicht ausgewählt" },
        { label: "Farbe", value: purchaseData.selectedColor || "Nicht ausgewählt" },
        {
            label: "Design",
            value: `${Object.values(purchaseData.sides).filter((e) => e.uploadedGraphic).length} Motive (Seiten)`,
        },
        { label: "Veredelungen", value: purchaseData.veredelungen || "Keine" },
        { label: "Profi Datencheck", value: purchaseData.dataCheck ? "Ja" : "Nein" },
        { label: "Stückzahl", value: purchaseData.quantity },
    ];

    return (
        <div className="lg:px-16 lg:mt-8 font-body">
            <H2 klasse="mb-4">Zusammenfassung</H2>
            <div className="flex flex-col gap-3">
                {/* Map each item to ListElement component */}
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
            </div>

            {/* Final Price */}
            <div className="mt-8">
                <P klasse="text-lg font-semibold mb-4">Gesamtpreis:</P>
                <H3 klasse="text-xl">EUR {purchaseData.price.toFixed(2)}</H3>
            </div>
        </div>
    );
}
