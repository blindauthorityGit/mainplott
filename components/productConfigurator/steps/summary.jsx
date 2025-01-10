import React from "react";
import useStore from "@/store/store"; // Zustand store
import { ListElement } from "@/components/list";
import { H2, H3, P } from "@/components/typography";
import { calculateNetPrice } from "@/functions/calculateNetPrice"; // Import your net price function

export default function OrderSummary() {
    const { purchaseData } = useStore();

    const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

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
    const sizeQuantityList = Object.entries(purchaseData.variants || {})
        .map(([size, variant]) => ({
            label: `Größe ${size}`,
            value: `${variant.quantity} Stück`,
            size, // Keep the size for sorting
        }))
        .sort((a, b) => {
            const aIndex = sizeOrder.indexOf(a.size.toUpperCase());
            const bIndex = sizeOrder.indexOf(b.size.toUpperCase());

            // Handle sizes not found in sizeOrder
            if (aIndex === -1 && bIndex === -1) {
                return a.size.localeCompare(b.size);
            }
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;

            return aIndex - bIndex;
        });

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
                {sizeQuantityList.map((item, index) =>
                    item.value.split("")[0] == 0 || item.label.split(" ")[1] == "profiDatenCheck" ? null : (
                        <ListElement
                            width="!w-2/6"
                            key={`size-${index}`}
                            index={index + summaryData.length} // Offset index for unique keys
                            label={item.label}
                            description={item.label}
                            value={item.value}
                        />
                    )
                )}
            </div>

            {/* Final Price */}
            <div className="mt-8">
                <P klasse="text-lg font-semibold mb-4">Gesamtpreis:</P>
                <H3 klasse="text-xl">
                    EUR {purchaseData.tryout ? "0,-" : calculateNetPrice(purchaseData.totalPrice.toFixed(2))}
                </H3>
                <P klasse="!text-sm">
                    {purchaseData.veredelungTotal &&
                        `Davon EUR ${calculateNetPrice(purchaseData.veredelungTotal)} für Verdelungen`}
                </P>
                <P klasse="!text-sm">
                    {purchaseData.profiDatenCheck &&
                        `Davon EUR ${purchaseData.profiDatenCheckPrice}.00 für Profi DatenCheck`}
                </P>
            </div>
        </div>
    );
}
