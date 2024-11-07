import React, { useState } from "react";
import { Slider, Tabs, Tab, Checkbox, FormControlLabel, Button } from "@mui/material";
import { P } from "@/components/typography";
import useStore from "@/store/store";
import ContentWrapper from "../components/contentWrapper";

export default function ConfigureDesign() {
    const { purchaseData, setPurchaseData } = useStore();
    const [activeTab, setActiveTab] = useState(0); // Track which tab is active
    const [copyFrontToBack, setCopyFrontToBack] = useState(false);

    const containerWidth = purchaseData.containerWidth || 500; // Set a default value for safety
    const containerHeight = purchaseData.containerHeight || 500;

    const currentSide = activeTab === 0 ? "front" : "back";

    const handleXChange = (event, newValue) => {
        setPurchaseData({
            ...purchaseData,
            [currentSide]: {
                ...purchaseData[currentSide],
                xPosition: newValue,
            },
        });
    };

    const handleYChange = (event, newValue) => {
        setPurchaseData({
            ...purchaseData,
            [currentSide]: {
                ...purchaseData[currentSide],
                yPosition: newValue,
            },
        });
    };

    const handleScaleChange = (event, newValue) => {
        setPurchaseData({
            ...purchaseData,
            [currentSide]: {
                ...purchaseData[currentSide],
                scale: newValue,
            },
        });
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleCopyFrontToBack = (event) => {
        const isChecked = event.target.checked;
        setCopyFrontToBack(isChecked);

        if (isChecked && purchaseData.front.uploadedGraphic) {
            // Copy front design to back, with a new entry in purchaseData
            setPurchaseData({
                ...purchaseData,
                back: {
                    ...purchaseData.front, // Copy all front design properties to back
                    xPosition: 0, // Reset the position for adjustments
                    yPosition: 0,
                },
            });
        }
    };

    const handleGraphicUpload = (event, side) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPurchaseData({
                    ...purchaseData,
                    [side]: {
                        ...purchaseData[side],
                        uploadedGraphic: e.target.result,
                    },
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const stepData = {
        title: "Design anpassen",
        description: "Passen Sie das Design auf dem Produkt an.",
    };

    return (
        <div className="flex flex-col lg:px-16 lg:mt-8">
            <ContentWrapper data={stepData} />

            {/* Material-UI Tabs Component */}
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                aria-label="Product side tabs"
                className="font-body"
            >
                <Tab label="Vorderseite" />
                {purchaseData.selectedVariant?.backImageUrl && <Tab label="Rückseite" />}
            </Tabs>

            {/* Sliders Section */}
            <div className="mb-4">
                <P klasse="!text-sm !mb-2">X-Achse Position</P>
                <Slider
                    value={purchaseData[currentSide].xPosition}
                    min={0} // Minimum position on the X-axis
                    max={containerWidth} // Maximum position on the X-axis
                    onChange={handleXChange}
                    aria-labelledby="x-axis-slider"
                />
            </div>
            <div className="mb-4">
                <P klasse="!text-sm !mb-2">Y-Achse Position</P>
                <Slider
                    value={purchaseData[currentSide].yPosition}
                    min={0} // Minimum position on the Y-axis
                    max={containerHeight} // Maximum position on the Y-axis
                    onChange={handleYChange}
                    aria-labelledby="y-axis-slider"
                />
            </div>
            <div className="mb-4">
                <P klasse="!text-sm !mb-2">Größe</P>
                <Slider
                    value={purchaseData[currentSide].scale}
                    min={0.3}
                    max={2.5}
                    step={0.01}
                    onChange={handleScaleChange}
                    aria-labelledby="scale-slider"
                />
            </div>

            {/* Upload Button Section */}
            <div className="mb-4">
                <P klasse="!text-sm !mb-2">{activeTab === 0 ? "Vorderseite hochladen" : "Rückseite hochladen"}</P>
                <Button variant="contained" component="label" color="primary" className="mb-4">
                    Datei hochladen
                    <input type="file" hidden onChange={(e) => handleGraphicUpload(e, currentSide)} />
                </Button>
            </div>

            {/* Copy Front Design to Back */}
            {activeTab === 1 && (
                <FormControlLabel
                    control={<Checkbox checked={copyFrontToBack} onChange={handleCopyFrontToBack} color="primary" />}
                    label="Vorderseite auf Rückseite kopieren"
                />
            )}
        </div>
    );
}
