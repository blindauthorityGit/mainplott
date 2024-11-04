import React, { useState } from "react";
import { Slider } from "@mui/material";
import { H2, P } from "@/components/typography";
import useStore from "@/store/store";

export default function ConfigureDesign() {
    const { purchaseData, setPurchaseData } = useStore();
    const [xPosition, setXPosition] = useState(0);
    const [yPosition, setYPosition] = useState(0);
    const [scale, setScale] = useState(1);

    const handleXChange = (event, newValue) => {
        setXPosition(newValue);
        setPurchaseData({ ...purchaseData, xPosition: newValue });
    };

    const handleYChange = (event, newValue) => {
        setYPosition(newValue);
        setPurchaseData({ ...purchaseData, yPosition: newValue });
    };

    const handleScaleChange = (event, newValue) => {
        setScale(newValue);
        setPurchaseData({ ...purchaseData, scale: newValue });
    };

    return (
        <div>
            <H2 klasse="!mb-4">Design konfigurieren</H2>
            <P klasse="!mb-6">Passen Sie das Design auf dem Produkt an.</P>
            <div className="mb-4">
                <P klasse="!text-sm !mb-2">X-Achse Position</P>
                <Slider
                    value={xPosition}
                    min={-100}
                    max={100}
                    onChange={handleXChange}
                    aria-labelledby="x-axis-slider"
                />
            </div>
            <div className="mb-4">
                <P klasse="!text-sm !mb-2">Y-Achse Position</P>
                <Slider
                    value={yPosition}
                    min={-100}
                    max={100}
                    onChange={handleYChange}
                    aria-labelledby="y-axis-slider"
                />
            </div>
            <div className="mb-4">
                <P klasse="!text-sm !mb-2">Größe</P>
                <Slider
                    value={scale}
                    min={0.5}
                    max={2}
                    step={0.01}
                    onChange={handleScaleChange}
                    aria-labelledby="scale-slider"
                />
            </div>
        </div>
    );
}
