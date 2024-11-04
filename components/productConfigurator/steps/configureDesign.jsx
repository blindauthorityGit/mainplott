import React, { useState } from "react";
import { Slider } from "@mui/material";
import { H2, P } from "@/components/typography";
import useStore from "@/store/store";
import ContentWrapper from "../components/contentWrapper";

export default function ConfigureDesign() {
    const { purchaseData, setPurchaseData } = useStore();

    const handleXChange = (event, newValue) => {
        setPurchaseData({ ...purchaseData, xPosition: newValue });
    };

    const handleYChange = (event, newValue) => {
        setPurchaseData({ ...purchaseData, yPosition: newValue });
    };

    const handleScaleChange = (event, newValue) => {
        setPurchaseData({ ...purchaseData, scale: newValue });
    };

    const stepData = {
        title: "Design konfigurieren",
        description: "Passen Sie das Design auf dem Produkt an.",
    };

    return (
        <div className="flex flex-col lg:px-16 lg:mt-8">
            <ContentWrapper data={stepData} />

            <div className="mb-4">
                <P klasse="!text-sm !mb-2">X-Achse Position</P>
                <Slider
                    value={purchaseData.xPosition}
                    min={-100}
                    max={400}
                    onChange={handleXChange}
                    aria-labelledby="x-axis-slider"
                />
            </div>
            <div className="mb-4">
                <P klasse="!text-sm !mb-2">Y-Achse Position</P>
                <Slider
                    value={purchaseData.yPosition}
                    min={-100}
                    max={500}
                    onChange={handleYChange}
                    aria-labelledby="y-axis-slider"
                />
            </div>
            <div className="mb-4">
                <P klasse="!text-sm !mb-2">Größe</P>
                <Slider
                    value={purchaseData.scale}
                    min={0.1}
                    max={2.5}
                    step={0.01}
                    onChange={handleScaleChange}
                    aria-labelledby="scale-slider"
                />
            </div>
        </div>
    );
}
